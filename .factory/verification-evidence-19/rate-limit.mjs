import {writeFile} from 'node:fs/promises';

const url='https://api.sociobot.in/api/v1/products/apk-provenance-locker/verify?license=verification-19-invalid-token';
const attempts=[];
for(let number=1;number<=50;number+=1){
  const response=await fetch(url,{headers:{origin:'https://apk-provenance-locker.sociobot.in','user-agent':'apk-provenance-locker-independent-verification-19'}});
  attempts.push({number,status:response.status,retryAfter:response.headers.get('retry-after'),allowOrigin:response.headers.get('access-control-allow-origin')});
  await response.arrayBuffer();
  if(response.status===429)break;
}
const report={checkedAt:new Date().toISOString(),allowance:attempts.filter(attempt=>attempt.status!==429).length,first429:attempts.find(attempt=>attempt.status===429)||null,attempts};
await writeFile('.factory/verification-evidence-19/rate-limit.json',`${JSON.stringify(report,null,2)}\n`);
console.log(JSON.stringify(report,null,2));
if(!report.first429||!report.first429.retryAfter)process.exitCode=1;
