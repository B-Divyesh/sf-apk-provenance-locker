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

export function assertMainResponse(expectedCommit,status,record){
  invariant(status>=200&&status<300,`GitHub origin/main lookup returned HTTP ${status}`);
  invariant(record&&record.sha===expectedCommit,`origin/main is ${record?.sha||'unavailable'}; push final candidate ${expectedCommit} before release`);
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
  const mainResponse=await request('/commits/main');
  const mainRecord=await mainResponse.json().catch(()=>null);
  assertMainResponse(expectedCommit,mainResponse.status,mainRecord);
  return {repository,branch:'main',expectedCommit,remoteCommit:mainRecord.sha,obtainable:true};
}

async function runRegression(){
  const missing='d7186184975c193d520d40a14b27fb552067e8ce';
  const available='d71861d6633f0e1d5c1d67e2ab1845a7f12e115f';
  let message='';
  try{assertCandidateResponse(missing,422,{message:'No commit found for SHA'})}catch(error){message=error instanceof Error?error.message:String(error)}
  invariant(message===`Candidate ${missing} is not obtainable from origin. Push the final candidate before building or publishing release artifacts.`,'The nonexistent-candidate regression did not fail closed');
  assertCandidateResponse(available,200,{sha:available});
  let mainMessage='';
  try{assertMainResponse(missing,200,{sha:available})}catch(error){mainMessage=error instanceof Error?error.message:String(error)}
  invariant(mainMessage===`origin/main is ${available}; push final candidate ${missing} before release`,'The unpushed-candidate regression did not fail closed');
  console.log(JSON.stringify({regression:'verifier-17-nonexistent-candidate',missing,status:422,available,rejected:true}));
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
