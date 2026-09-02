import { readFileSync } from 'node:fs';
import { describe,expect,it } from 'vitest';

const html=readFileSync('web/index.html','utf8'),script=readFileSync('web/app.js','utf8'),css=readFileSync('web/styles.css','utf8');

describe('judge-visible UI contracts',()=>{
  it('lists the complete mobile navigation and Brain2 identity surfaces',()=>{for(const label of ['Home / Today','Areas / Missions','Progress / Patterns','Morning Brief','Journal / Reflection','Council','Library / Advisors','Transparency / Analytics'])expect(html).toContain(label);expect(html).toContain('SOVEREIGN OS')});
  it('keeps the WebMCP catalogue visible without browser discovery',()=>{expect(html).toContain('12 TOOL CONTRACTS');expect(script).toContain('BROWSER AGENT DISCOVERY UNAVAILABLE');expect(script).toContain('The 12 implemented tool contracts remain listed');for(const tool of ['read_recent_history','find_longitudinal_patterns','list_appointed_advisors','propose_next_action','commit_proposed_action'])expect(script).toContain(tool)});
  it('separates recent-history title, description, date, and canonical ID',()=>{for(const className of ['history-row','row-description','row-meta','row-id'])expect(script).toContain(className);expect(css).toContain('.history-row>div');expect(css).toContain('.row-description')});
  it('shows council appointments, evidence lanes, and stages before a run',()=>{expect(html).toContain('council-ready');for(const phrase of ['Personal lane:','Source lane:','Read current state','Validate and hydrate citations','wait for approval'])expect(script).toContain(phrase)});
});
