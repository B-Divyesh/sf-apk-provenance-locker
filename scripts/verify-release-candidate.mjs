import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const repository='B-Divyesh/sf-apk-provenance-locker';
const defaultApiBase=`https://api.github.com/repos/${repository}`;

function invariant(condition,message){if(!condition)throw new Error(message)}

export function assertCandidateResponse(expectedCommit,status,record){
  invariant(/^[0-9a-f]{40}$/.test(expectedCommit),`Candidate commit must be a complete lowercase SHA: ${expectedCommit}`);
  if(status===404||status===422){
    throw new Error(`Candidate ${expectedCommit} is not obtainable from origin. Push the final candidate before building or publishing release artifacts.`);
  }
  invariant(status>=200&&status<300,`GitHub commit lookup returned HTTP ${status}`);
  invariant(record&&record.sha===expectedCommit,`GitHub resolved candidate ${expectedCommit} to ${record?.sha||'no commit'}`);
}

export function assertMainContainsCandidate(expectedCommit,status,record){
  invariant(status>=200&&status<300,`GitHub origin/main comparison returned HTTP ${status}`);
  invariant(record&&['ahead','identical'].includes(record.status),`origin/main does not contain candidate ${expectedCommit}; comparison status is ${record?.status||'unavailable'}`);
  invariant(record.merge_base_commit?.sha===expectedCommit,`origin/main comparison does not retain candidate ${expectedCommit} as its merge base`);
}

export async function verifyReleaseCandidate({
  expectedCommit,
  apiBase=defaultApiBase,
  token=process.env.GITHUB_TOKEN,
  fetchImpl=fetch,
}={}){
  const headers={'user-agent':'apk-provenance-locker-candidate-check',accept:'application/vnd.github+json',...(token?{authorization:`Bearer ${token}`}:{})};
  const request=path=>fetchImpl(`${apiBase}${path}`,{headers});
  const candidateResponse=await request(`/commits/${expectedCommit}`);
  const candidateRecord=await candidateResponse.json().catch(()=>null);
  assertCandidateResponse(expectedCommit,candidateResponse.status,candidateRecord);
  const mainResponse=await request(`/compare/${expectedCommit}...main`);
  const mainRecord=await mainResponse.json().catch(()=>null);
  assertMainContainsCandidate(expectedCommit,mainResponse.status,mainRecord);
  return {repository,branch:'main',expectedCommit,branchRelation:mainRecord.status,obtainable:true,containedByMain:true};
}

async function runRegression(){
  const missing='d7186184975c193d520d40a14b27fb552067e8ce';
  const candidate='058fe2ce981fead74ea63fd612da05baaadaecfe';
  const advancedMain='c6a968c31dc97443b743a932f09c335070aa70dd';
  let message='';
  try{assertCandidateResponse(missing,422,{message:'No commit found for SHA'})}catch(error){message=error instanceof Error?error.message:String(error)}
  invariant(message===`Candidate ${missing} is not obtainable from origin. Push the final candidate before building or publishing release artifacts.`,'The nonexistent-candidate regression did not fail closed');
  assertCandidateResponse(candidate,200,{sha:candidate});
  assertMainContainsCandidate(candidate,200,{status:'ahead',merge_base_commit:{sha:candidate},head_commit:{sha:advancedMain}});
  let ancestryMessage='';
  try{assertMainContainsCandidate(candidate,200,{status:'diverged',merge_base_commit:{sha:'d71861d6633f0e1d5c1d67e2ab1845a7f12e115f'},head_commit:{sha:advancedMain}})}catch(error){ancestryMessage=error instanceof Error?error.message:String(error)}
  invariant(ancestryMessage===`origin/main does not contain candidate ${candidate}; comparison status is diverged`,'The non-ancestor candidate regression did not fail closed');
  console.log(JSON.stringify({regression:'verifier-19-advanced-main-ancestor',missing,candidate,advancedMain,relation:'ahead',accepted:true}));
}

async function main(){
  const args=process.argv.slice(2);
  if(args.includes('--self-test'))return runRegression();
  const index=args.indexOf('--expected-commit');
  const expectedCommit=(index>=0?args[index+1]:process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'})).trim();
  console.log(JSON.stringify(await verifyReleaseCandidate({expectedCommit}),null,2));
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main().catch(error=>{console.error(error instanceof Error?error.message:String(error));process.exitCode=1});
}
