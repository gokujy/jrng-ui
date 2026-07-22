import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

export type JNavigationProgressState='idle'|'running'|'success'|'error';
export interface JNavigationProgressAdapter { subscribe(handlers:{start:()=>void;complete:()=>void;error:()=>void}):()=>void; }

@Injectable({providedIn:'root'})
export class JNavigationProgressService{
  private readonly browser=isPlatformBrowser(inject(PLATFORM_ID));private readonly operations=signal(new Set<unknown>());private shownAt=0;private showTimer?:ReturnType<typeof setTimeout>;private hideTimer?:ReturnType<typeof setTimeout>;
  readonly delay=signal(120);readonly minimumVisible=signal(250);readonly visible=signal(false);readonly state=signal<JNavigationProgressState>('idle');readonly count=computed(()=>this.operations().size);readonly active=computed(()=>this.count()>0);
  start(key:unknown=Symbol('navigation')):unknown{this.operations.update(v=>new Set(v).add(key));this.state.set('running');this.scheduleShow();return key;}
  complete(key?:unknown):void{this.finish(key,'success');}
  error(key?:unknown):void{this.finish(key,'error');}
  reset():void{this.operations.set(new Set());this.visible.set(false);this.state.set('idle');this.clearTimers();}
  track<T>(work:Promise<T>,key?:unknown):Promise<T>{const token=this.start(key);return work.then(v=>{this.complete(token);return v;},e=>{this.error(token);throw e;});}
  connect(adapter:JNavigationProgressAdapter):()=>void{return adapter.subscribe({start:()=>{this.start('router');},complete:()=>this.complete('router'),error:()=>this.error('router')});}
  private finish(key:unknown,state:'success'|'error'){this.operations.update(v=>{const n=new Set(v);if(key===undefined)n.clear();else n.delete(key);return n;});if(this.operations().size)return;this.state.set(state);const remaining=Math.max(0,this.minimumVisible()-(Date.now()-this.shownAt));this.hideTimer=setTimeout(()=>{this.visible.set(false);this.state.set('idle');},remaining);}
  private scheduleShow(){if(!this.browser||this.visible()||this.showTimer)return;this.showTimer=setTimeout(()=>{this.showTimer=undefined;if(this.active()){this.shownAt=Date.now();this.visible.set(true);}},this.delay());}
  private clearTimers(){if(this.showTimer)clearTimeout(this.showTimer);if(this.hideTimer)clearTimeout(this.hideTimer);this.showTimer=this.hideTimer=undefined;}
}
