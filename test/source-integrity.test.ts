import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe,expect,it } from 'vitest';
import { SOURCE_CHUNKS } from '../worker/domain';

const manifests=[
  ['sources/marcus-aurelius.json','sources/canonical/marcus-aurelius-pg2680-excerpts.txt'],
  ['sources/epictetus.json','sources/canonical/epictetus-pg10661-excerpts.txt'],
  ['sources/sun-tzu.json','sources/canonical/sun-tzu-pg132-excerpts.txt']
] as const;

describe('canonical source ingestion',()=>{
  it.each(manifests)('verifies declared file checksum and every exact excerpt in %s',(manifestPath,sourcePath)=>{
    const manifest=JSON.parse(readFileSync(manifestPath,'utf8')) as {source_sha256:string;chunks:{id:string;text:string;locator:string}[]};
    const source=readFileSync(sourcePath,'utf8');expect(createHash('sha256').update(source).digest('hex')).toBe(manifest.source_sha256);
    for(const chunk of manifest.chunks){expect(source.includes(chunk.text)).toBe(true);const runtime=SOURCE_CHUNKS.find(item=>item.id===chunk.id);expect(runtime?.text).toBe(chunk.text);expect(runtime?.locator).toBe(chunk.locator)}
  });
});
