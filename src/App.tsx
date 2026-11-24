import React, { useState, useRef } from 'react';
import { Callout, Caption, Closing, CloseButton, FileButton, FileCard, Header, ChoiceRow, Slider, TextField, TextLink, useLocalState } from './shim';

const ACTIVITIES = [
 { value:'sedentary',label:'Sedentary',factor:1.2 },
 { value:'light',label:'Light',factor:1.375 },
 { value:'moderate',label:'Moderate',factor:1.55 },
 { value:'active',label:'Active',factor:1.725 },
 { value:'extra',label:'Very active',factor:1.9 }
];
const THEMES = [
 {id:'midnight',name:'Midnight',arabic:'Black',color:'#101216'},
 {id:'graphite',name:'Graphite',arabic:'Gray',color:'#737b89'},
 {id:'ocean',name:'Ocean',arabic:'Blue',color:'#3478f6'},
 {id:'navy',name:'Navy',arabic:'Navy',color:'#244c80'},
 {id:'forest',name:'Forest',arabic:'Green',color:'#14866f'},
 {id:'violet',name:'Violet',arabic:'Purple',color:'#8761da'}
];
const DEFAULTS = {name:'',age:18,weight:70,height:170,sex:'male',activity:'moderate'};
const fmt = (n:number) => (Math.round(n/10)*10).toLocaleString('en-US');
export function App(){
 const [profile,setProfile,saved] = useLocalState('calx-profile.v1',DEFAULTS);
 const [theme,setTheme,themeSaved] = useLocalState('ef-theme.v1','ocean');
 const [goal,setGoal,goalSaved] = useLocalState('ef-goal.v1',{direction:'maintain',kg:''});
 const [goalOpen,setGoalOpen] = useState(false);
 const [draftGoal,setDraftGoal] = useState({direction:'maintain',kg:''});
 const [deleteNotice,setDeleteNotice] = useState(false);
 const goalDialog = useRef<HTMLDialogElement>(null);
 const deleteDialog = useRef<HTMLDialogElement>(null);
 const [themeOpen,setThemeOpen] = useState(true);
 const [result,setResult] = useState<null|{bmr:number;tdee:number;loss:number;gain:number;clamped:boolean}>(null);
 const [minorNote,setMinorNote] = useState(false);
 const ready = saved.ready;
 const set = (patch:Partial<typeof DEFAULTS>) => { if(ready){setProfile({...profile,...patch});setResult(null);setMinorNote(false);setGoalOpen(false);setDeleteNotice(false);} };
 const calculate = () => {
  if(profile.age<18){setResult(null);setMinorNote(true);return;}
  const base = 10*profile.weight+6.25*profile.height-5*profile.age;
  const bmr = base+(profile.sex==='male'?5:-161);
  const tdee = bmr*(ACTIVITIES.find(a=>a.value===profile.activity)??ACTIVITIES[2]).factor;
  setResult({bmr,tdee,loss:Math.max(tdee-500,1200),gain:tdee+300,clamped:tdee-500<1200});setMinorNote(false);
 };
 const bmi = profile.weight / ((profile.height/100)**2);
 const goalKg = Number(draftGoal.kg);
 const targetWeight = draftGoal.direction==='loss'?profile.weight-goalKg:profile.weight+goalKg;
 const goalValid = draftGoal.direction==='maintain'||(Number.isFinite(goalKg)&&goalKg>0&&targetWeight>0&&(profile.age<20||targetWeight/((profile.height/100)**2)>=18.5));
 const resetAll = () => {setProfile({...DEFAULTS});setGoal({direction:'maintain',kg:''});setResult(null);setMinorNote(false);setGoalOpen(false);setDeleteNotice(true);deleteDialog.current?.close();};
 const selectedTheme=THEMES.find(t=>t.id===theme)??THEMES[2];
 return <FileCard lang="en" dir="ltr"><div className={`ef-app ef-${selectedTheme.id}`}>
  <div className="ef-topbar">
   <FileButton compact variant="secondary" disabled={!themeSaved.ready} onClick={()=>setThemeOpen(!themeOpen)} aria-expanded={themeOpen}><span className="ef-theme-dot"/>Theme · {selectedTheme.arabic}</FileButton>
   <span className="ef-brand" dir="ltr">ELHDAD <span>FIT</span><small>YOUR DAILY BALANCE</small></span>
  </div>
  {themeOpen&&<div className="ef-themes" aria-label="Choose a theme">{THEMES.map(t=><FileButton key={t.id} compact variant="ghost" selected={t.id===selectedTheme.id} disabled={!themeSaved.ready} onClick={()=>{setTheme(t.id);}}><span className="ef-swatch" style={{background:t.color}}/><span>{t.arabic}</span></FileButton>)}</div>}
  <div className="ef-intro"><div className="ef-kicker">YOUR DAILY CALCULATOR</div><Header title="Calories" intro="Know your needs. Choose your goal. Take the next step."/><span className="ef-tag">MAINTAIN · LOSE · GAIN</span></div>
  <div className="ef-layout">
   <section className="ef-form">
    <div className="ef-section-title"><span className="ef-step">01</span><div><h2>Start with your details</h2><p>One minute. A clearer starting point.</p></div></div>
    <div className="ef-field ef-name"><TextField label="Name" value={profile.name} onChange={value=>set({name:value})}/></div>
    <div className="ef-fields">
     <div className="ef-field"><Slider label="Age" min={13} max={80} value={profile.age} onChange={value=>set({age:value})} describe={value=>`${value.toLocaleString('en-US')} years`}/></div>
     <div className="ef-field"><Slider label="Weight" min={30} max={200} value={profile.weight} onChange={value=>set({weight:value})} describe={value=>`${value.toLocaleString('en-US')} kg`}/></div>
     <div className="ef-field"><Slider label="Height" min={120} max={220} value={profile.height} onChange={value=>set({height:value})} describe={value=>`${value.toLocaleString('en-US')} cm`}/></div>
     <div className="ef-field"><ChoiceRow label="Sex" options={[{value:'male',label:'Male'},{value:'female',label:'Female'}]} value={profile.sex} onChange={value=>set({sex:value})}/></div>
    </div>
    <div className="ef-field ef-activity"><ChoiceRow label="Activity level" options={ACTIVITIES.map(a=>({value:a.value,label:a.label}))} value={profile.activity} onChange={value=>set({activity:value})}/><p className="ef-hint">Light: 1–3 days/week · Moderate: 3–5 · Active: 6–7.</p></div>
    <div className="ef-calculate"><FileButton variant="primary" disabled={!ready} onClick={calculate}>Calculate my calories →</FileButton></div>
    <div className="ef-storage"><Caption>{saved.message||'Your details stay on this device.'}</Caption>{themeSaved.message&&themeSaved.message!==saved.message&&<Caption>{themeSaved.message}</Caption>}</div>
   </section>
   <section className="ef-results" aria-live="polite">
    <div className="ef-section-title"><span className="ef-step">02</span><div><h2>{result?(profile.name.trim()?`Your calories, ${profile.name.trim()}`:'Your calories'):'Your goal, in numbers'}</h2><p>Calories per day</p></div></div>
    {minorNote?<div className="ef-note"><h3>For adults only</h3><p>Calorie estimates are not shown for anyone under 18. Ask a doctor or registered dietitian about your needs.</p></div>:<div className="ef-stats">{[
     {label:'Maintain',value:result?.tdee,detail:'Estimated daily needs',main:true},
     {label:'Lose',value:result?.loss,detail:result?.clamped?'Calculation floor: 1,200. Not a safety guarantee.':'500 calories below maintenance'},
     {label:'Gain',value:result?.gain,detail:'300 calories above maintenance'}
    ].map((s,i)=><div key={s.label} className={`ef-stat ${s.main?'ef-stat-main':''}`}><div className="ef-stat-top"><span>{s.label}</span><span className="ef-stat-icon">{['=','−','+'][i]}</span></div><strong>{s.value!==undefined?fmt(s.value):'···'}</strong><p>{s.detail}</p></div>)}</div>}
    {result&&<div className="ef-bmr"><span>Basal metabolic rate <bdi>BMR</bdi></span><strong>{fmt(result.bmr)}</strong></div>}
    {!result&&!minorNote&&<p className="ef-hint ef-empty">Enter your details, then select Calculate my calories.</p>}
    <p className="ef-disclaimer">Estimates for adults aged 18+. Not a substitute for medical or dietetic advice. Weight change varies from person to person.</p>
    {result?.clamped&&<div className="ef-note">The loss estimate stops at 1,200 calories. This is a calculation limit, not a safe intake recommendation. Seek professional advice before reducing intake.</div>}
   </section>
  </div>
  {result&&<section className="ef-goal-section">
   <div className="ef-section-title"><span className="ef-step">03</span><div><h2>Your next step</h2><p>A goal you choose. Not a judgment about your body.</p></div></div>
   <div className="ef-goal-guidance">{profile.age<20?<p>At ages 18 and 19, weight assessment uses age, sex and growth charts. We do not automatically suggest weight gain or loss. Choose a goal with a dietitian.</p>:<><p>Body mass index <bdi>BMI {bmi.toFixed(1)}</bdi> · {bmi<18.5?'Below the reference range':bmi<25?'Within the reference range': 'Above the reference range'}</p><p>{bmi<18.5?'Consider discussing weight gain with a professional before choosing a number.':bmi<25?'This number alone does not mean you need to change your weight. Maintenance may be a suitable choice.':'You can discuss weight loss with a professional if it suits your health and goals.'} BMI is a screening tool, not a diagnosis. It does not distinguish muscle from fat.</p></>}</div>
   <button type="button" className="ef-goal-toggle" aria-expanded={goalOpen} onClick={()=>{setDraftGoal({...goal});setGoalOpen(true);goalDialog.current?.showModal();}}>Set a weight goal <span aria-hidden="true">+</span></button>
   <dialog ref={goalDialog} className="ef-confirm ef-goal-dialog" aria-labelledby="ef-goal-title" onClose={()=>setGoalOpen(false)}><CloseButton label="Close" onClick={()=>goalDialog.current?.close()}/><div className="ef-reset-kicker" dir="ltr">A LITTLE FINE-TUNING</div><h2 id="ef-goal-title">Set your goal</h2><div className="ef-goal-editor"><ChoiceRow label="Choose your direction" options={[{value:'maintain',label:'Maintain'},{value:'loss',label:'Lose weight'},{value:'gain',label:'Gain weight'}]} value={draftGoal.direction} onChange={direction=>{if(goalSaved.ready)setDraftGoal({...draftGoal,direction});}}/>
    {draftGoal.direction!=='maintain'&&<div className="ef-goal-input"><label htmlFor="ef-goal-kg">{draftGoal.direction==='loss'?'How many kg would you like to lose?':'How many kg would you like to gain?'}</label><input id="ef-goal-kg" type="number" inputMode="decimal" min="0.1" step="0.1" placeholder={draftGoal.direction==='loss'?'Kg to lose':'Kg to gain'} value={draftGoal.kg} disabled={!goalSaved.ready} onChange={e=>setDraftGoal({...draftGoal,kg:e.target.value})}/></div>}
    {draftGoal.direction==='maintain'?<p className="ef-goal-status">Your choice: maintain your weight.</p>:draftGoal.kg!==''&&<p className="ef-goal-status" role="status">{goalValid?`Your choice: ${draftGoal.direction==='loss'?'lose':'gain'} ${goalKg.toLocaleString('en-US')} kg. This records your preference, not medical advice.`:'Enter a positive amount that does not produce an invalid weight or fall below the adult screening range. Review your goal with a professional.'}</p>}
    <p className="ef-hint">No guaranteed timeline or automatic calorie changes. This optional goal is not a treatment plan.</p><Caption>{goalSaved.message}</Caption>
   </div><div className="ef-goal-dialog-actions"><button type="button" className="ef-goal-cancel" onClick={()=>goalDialog.current?.close()}>Cancel</button><button type="button" className="ef-goal-save" disabled={!goalSaved.ready||!goalValid} onClick={()=>{setGoal({...draftGoal});goalDialog.current?.close();}}>Save goal</button></div></dialog>
  </section>}
  <div className="ef-delete-area"><button type="button" className="ef-delete" disabled={!ready||!goalSaved.ready||!themeSaved.ready} onClick={()=>deleteDialog.current?.showModal()}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>Delete all</button><p className="ef-hint">You will be asked to confirm before anything is reset.</p>{deleteNotice&&<p role="status">Your details, goal and results have been cleared. Your theme stays as you chose it.</p>}</div>
  <dialog ref={deleteDialog} className="ef-confirm ef-delete-dialog" aria-labelledby="ef-confirm-title" onCancel={()=>deleteDialog.current?.close()}><CloseButton label="Close" onClick={()=>deleteDialog.current?.close()}/><h2 id="ef-confirm-title">clear all your Data?</h2><div className="ef-confirm-actions"><button type="button" onClick={()=>deleteDialog.current?.close()}>Keep my data</button><button type="button" className="ef-delete" onClick={resetAll}>Clear all</button></div></dialog>
  <details className="ef-method"><summary>Method and sources</summary><p>For adults only. We use the Mifflin–St Jeor equation and multiply basal metabolic rate by an activity factor. The loss estimate subtracts 500 calories, with a calculation floor of 1,200. The gain estimate adds 300. These are starting estimates, not promises of a specific weight change.</p><TextLink href="https://www.healthline.com/health/how-to-calculate-your-basal-metabolic-rate">Equation and activity factors, Healthline</TextLink><br/><TextLink href="https://www.mayoclinic.org/healthy-lifestyle/weight-loss/in-depth/calories/art-20048065">Calories and weight loss, Mayo Clinic</TextLink><br/><TextLink href="https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html">Adult BMI categories, ages 20+, CDC</TextLink><br/><TextLink href="https://www.cdc.gov/bmi/child-teen-calculator/">Weight assessment through age 19, CDC</TextLink></details>
  <Closing><span className="ef-footer-brand" dir="ltr">Elhdad Fit</span> · A smarter step toward your goal</Closing>
 </div></FileCard>;
}
