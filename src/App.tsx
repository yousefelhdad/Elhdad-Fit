import React, { useState, useRef, useEffect } from 'react';
import { Callout, Caption, Closing, CloseButton, FileButton, FileCard, Header, ChoiceRow, Slider, TextField, TextLink, useLocalState } from './shim';

const ACTIVITIES = [
 { value:'sedentary',factor:1.2 },
 { value:'light',factor:1.375 },
 { value:'moderate',factor:1.55 },
 { value:'active',factor:1.725 },
 { value:'extra',factor:1.9 }
];
const THEMES = [
 {id:'midnight',en:'Black',ar:'أسود',color:'#101216'},
 {id:'graphite',en:'Gray',ar:'رمادي',color:'#737b89'},
 {id:'ocean',en:'Blue',ar:'أزرق',color:'#3478f6'},
 {id:'navy',en:'Navy',ar:'كحلي',color:'#244c80'},
 {id:'forest',en:'Green',ar:'أخضر',color:'#14866f'},
 {id:'violet',en:'Purple',ar:'بنفسجي',color:'#8761da'}
];
const STR:any = {
 en:{
  settings:'Settings',theme:'Theme',language:'Language',
  kicker:'YOUR DAILY CALCULATOR',title:'Calories',intro:'Know your needs. Choose your goal. Take the next step.',tag:'MAINTAIN · LOSE · GAIN',
  sec1h:'Start with your details',sec1p:'One minute. A clearer starting point.',
  name:'Name',age:'Age',years:(v:number)=>`${v.toLocaleString('en-US')} years`,weight:'Weight',kg:(v:number)=>`${v.toLocaleString('en-US')} kg`,height:'Height',cm:(v:number)=>`${v.toLocaleString('en-US')} cm`,
  sex:'Sex',male:'Male',female:'Female',
  activity:'Activity level',
  act:{sedentary:'Sedentary',light:'Light',moderate:'Moderate',active:'Active',extra:'Very active'},
  actHint:'Light: 1–3 days/week · Moderate: 3–5 · Active: 6–7.',
  emptyHint:'Fill in your name and all details, then press Calculate. Your results appear here.',calc:'Calculate my calories →',
  storage:'Your details stay on this device.',
  resName:(n:string)=>`Your calories, ${n}`,res:'Your calories',perDay:'Calories per day',
  minorH:'For adults only',minorP:'Calorie estimates are not shown for anyone under 18. Ask a doctor or registered dietitian about your needs.',
  maintain:'Maintain',lose:'Lose',gain:'Gain',
  maintainD:'Estimated daily needs',loseFloorD:'Calculation floor: 1,200. Not a safety guarantee.',loseD:'500 calories below maintenance',gainD:'300 calories above maintenance',
  bmr:'Basal metabolic rate',
  disclaimer:'Estimates for adults aged 18+. Not a substitute for medical or dietetic advice. Weight change varies from person to person.',
  clamped:'The loss estimate stops at 1,200 calories. This is a calculation limit, not a safe intake recommendation. Seek professional advice before reducing intake.',
  sec3h:'Your next step',sec3p:'A goal you choose. Not a judgment about your body.',
  teen:'At ages 18 and 19, weight assessment uses age, sex and growth charts. We do not automatically suggest weight gain or loss. Choose a goal with a dietitian.',
  bmiLabel:'Body mass index',
  bmiBelow:'Below the reference range',bmiWithin:'Within the reference range',bmiAbove:'Above the reference range',
  bmiBelowP:'Consider discussing weight gain with a professional before choosing a number.',bmiWithinP:'This number alone does not mean you need to change your weight. Maintenance may be a suitable choice.',bmiAboveP:'You can discuss weight loss with a professional if it suits your health and goals.',
  bmiNote:'BMI is a screening tool, not a diagnosis. It does not distinguish muscle from fat.',
  setGoal:'Set a weight goal',
  fine:'A LITTLE FINE-TUNING',goalTitle:'Set your goal',direction:'Choose your direction',maintainOpt:'Maintain',lossOpt:'Lose weight',gainOpt:'Gain weight',
  kgLossL:'How many kg would you like to lose?',kgGainL:'How many kg would you like to gain?',kgLossPh:'Kg to lose',kgGainPh:'Kg to gain',
  goalMaintain:'Your choice: maintain your weight.',
  goalChoice:(d:string,kg:string)=>`Your choice: ${d==='loss'?'lose':'gain'} ${kg} kg. This records your preference, not medical advice.`,
  goalInvalid:'Enter a positive amount that does not produce an invalid weight or fall below the adult screening range. Review your goal with a professional.',
  goalHint:'No guaranteed timeline or automatic calorie changes. This optional goal is not a treatment plan.',
  cancel:'Cancel',saveGoal:'Save goal',close:'Close',
  deleteAll:'Delete all',
  deleted:'Your details, goal and results have been cleared. Your theme stays as you chose it.',
  method:'Method and sources',
  methodP:'For adults only. We use the Mifflin–St Jeor equation and multiply basal metabolic rate by an activity factor. The loss estimate subtracts 500 calories, with a calculation floor of 1,200. The gain estimate adds 300. These are starting estimates, not promises of a specific weight change.',
  closing:'A smarter step toward your goal',
  installTitle:'Install Elhdad Fit',installBody:'Add the app to your home screen for one-tap access.',
  installIOS:'Tap the Share button in Safari, then choose "Add to Home Screen".',
  installBtn:'Install',installDismiss:'Dismiss install message'
 },
 ar:{
  settings:'الإعدادات',theme:'المظهر',language:'اللغة',
  kicker:'حاسبتك اليومية',title:'السعرات الحرارية',intro:'اعرف احتياجك. اختر هدفك. وابدأ الخطوة الجاية.',tag:'حفاظ · خسارة · زيادة',
  sec1h:'ابدأ ببياناتك',sec1p:'دقيقة واحدة. نقطة بداية أوضح.',
  name:'الاسم',age:'السن',years:(v:number)=>`${v.toLocaleString('en-US')} سنة`,weight:'الوزن',kg:(v:number)=>`${v.toLocaleString('en-US')} كجم`,height:'الطول',cm:(v:number)=>`${v.toLocaleString('en-US')} سم`,
  sex:'النوع',male:'ذكر',female:'أنثى',
  activity:'مستوى النشاط',
  act:{sedentary:'قليل الحركة',light:'خفيف',moderate:'متوسط',active:'نشيط',extra:'نشيط جدًا'},
  actHint:'خفيف: 1–3 أيام/أسبوع · متوسط: 3–5 · نشيط: 6–7.',
  emptyHint:'املا اسمك وكل بياناتك، وبعدين اضغط احسب. نتائجك بتظهر هنا.',calc:'احسب سعراتي ←',
  storage:'بياناتك بتفضل على جهازك.',
  resName:(n:string)=>`سعراتك يا ${n}`,res:'سعراتك',perDay:'سعرات في اليوم',
  minorH:'للبالغين فقط',minorP:'لا تُعرض تقديرات السعرات لمن هم تحت 18 سنة. اسأل طبيبًا أو أخصائي تغذية عن احتياجاتك.',
  maintain:'حفاظ',lose:'خسارة',gain:'زيادة',
  maintainD:'احتياجك اليومي التقديري',loseFloorD:'حد الحساب: 1,200. ليس ضمانًا للأمان.',loseD:'أقل 500 سعر من الحفاظ',gainD:'أكثر 300 سعر من الحفاظ',
  bmr:'معدل الأيض الأساسي',
  disclaimer:'تقديرات للبالغين من سن 18 فأكثر. ليست بديلًا عن استشارة طبية أو غذائية. تغيّر الوزن يختلف من شخص لآخر.',
  clamped:'تقدير الخسارة يتوقف عند 1,200 سعر. هذا حد حسابي وليس توصية بمدخل آمن. استشر مختصًا قبل تقليل السعرات.',
  sec3h:'خطوتك الجاية',sec3p:'هدف تختاره أنت. مش حكم على جسمك.',
  teen:'في سن 18 و19، تقييم الوزن يعتمد على السن والنوع ومنحنيات النمو. لا نقترح تلقائيًا زيادة أو خسارة الوزن. اختر هدفك مع أخصائي تغذية.',
  bmiLabel:'مؤشر كتلة الجسم',
  bmiBelow:'أقل من النطاق المرجعي',bmiWithin:'ضمن النطاق المرجعي',bmiAbove:'أعلى من النطاق المرجعي',
  bmiBelowP:'يفضل مناقشة زيادة الوزن مع مختص قبل اختيار رقم.',bmiWithinP:'هذا الرقم وحده لا يعني أنك تحتاج لتغيير وزنك. الحفاظ قد يكون اختيارًا مناسبًا.',bmiAboveP:'يمكنك مناقشة خسارة الوزن مع مختص إذا كان يناسب صحتك وأهدافك.',
  bmiNote:'مؤشر كتلة الجسم أداة فحص أولية وليس تشخيصًا. لا يفرق بين العضل والدهون.',
  setGoal:'حدد هدف وزن',
  fine:'تعديل بسيط',goalTitle:'حدد هدفك',direction:'اختر اتجاهك',maintainOpt:'حفاظ',lossOpt:'خسارة وزن',gainOpt:'زيادة وزن',
  kgLossL:'عايز تخسر كام كجم؟',kgGainL:'عايز تزيد كام كجم؟',kgLossPh:'كجم للخسارة',kgGainPh:'كجم للزيادة',
  goalMaintain:'اختيارك: الحفاظ على وزنك.',
  goalChoice:(d:string,kg:string)=>`اختيارك: ${d==='loss'?'خسارة':'زيادة'} ${kg} كجم. هذا يسجل تفضيلك وليس نصيحة طبية.`,
  goalInvalid:'أدخل رقمًا موجبًا لا ينتج وزنًا غير صالح ولا يقل عن نطاق الفحص للبالغين. راجع هدفك مع مختص.',
  goalHint:'لا يوجد جدول زمني مضمون ولا تغيير تلقائي في السعرات. هذا الهدف اختياري وليس خطة علاجية.',
  cancel:'إلغاء',saveGoal:'حفظ الهدف',close:'إغلاق',
  deleteAll:'حذف الكل',
  deleted:'تم مسح بياناتك وهدفك ونتائجك. المظهر يفضل زي ما اخترته.',
  method:'الطريقة والمصادر',
  methodP:'للبالغين فقط. نستخدم معادلة ميفلين-سانت جيور ونضرب معدل الأيض الأساسي في معامل النشاط. تقدير الخسارة يطرح 500 سعر بحد أدنى حسابي 1,200. تقدير الزيادة يضيف 300. هذه تقديرات بداية وليست وعودًا بتغيير محدد في الوزن.',
  closing:'خطوة أذكى نحو هدفك',
  installTitle:'ثبّت Elhdad Fit',installBody:'ضف التطبيق لشاشتك الرئيسية للوصول بضغطة واحدة.',
  installIOS:'اضغط زر المشاركة في سفاري، ثم اختر "إضافة إلى الشاشة الرئيسية".',
  installBtn:'تثبيت',installDismiss:'تجاهل رسالة التثبيت'
 }
};
const DEFAULTS = {name:'',age:18,weight:70,height:170,sex:'male',activity:'moderate'};
const fmt = (n:number) => (Math.round(n/10)*10).toLocaleString('en-US');
export function App(){
 const [profile,setProfile,saved] = useLocalState('calx-profile.v1',DEFAULTS);
 const [theme,setTheme,themeSaved] = useLocalState('ef-theme.v1','ocean');
 const [lang,setLang] = useLocalState<'en'|'ar'>('ef-lang.v1','en');
 const [goal,setGoal,goalSaved] = useLocalState('ef-goal.v1',{direction:'maintain',kg:''});
 const [goalOpen,setGoalOpen] = useState(false);
 const [draftGoal,setDraftGoal] = useState({direction:'maintain',kg:''});
 const [deleteNotice,setDeleteNotice] = useState(false);
 const [touched,setTouched] = useState<Record<string,boolean>>({});
 const [complete,setComplete] = useLocalState('ef-complete.v1',false);
 const [installEvt,setInstallEvt] = useState<any>(null);
 const [installDismissed,setInstallDismissed] = useLocalState('ef-install-dismissed.v1',false);
 const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
 const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone;
 const forceInstallPreview = window.location.hash.includes('install-preview');
 const forceLangAr = window.location.hash.includes('lang-ar');
 useEffect(()=>{const h=(e:any)=>{e.preventDefault();setInstallEvt(e);};window.addEventListener('beforeinstallprompt',h);return ()=>window.removeEventListener('beforeinstallprompt',h);},[]);
 const showInstall = !standalone && !installDismissed && (installEvt || isIOS || forceInstallPreview);
 const goalDialog = useRef<HTMLDialogElement>(null);
 const [settingsOpen,setSettingsOpen] = useState(window.location.hash.includes('settings-preview'));
 const [result,setResult] = useState<null|{bmr:number;tdee:number;loss:number;gain:number;clamped:boolean}>(null);
 const [minorNote,setMinorNote] = useState(false);
 const forceTouched = window.location.hash.includes('touched-preview');
 const ready = saved.ready;
 const lang2 = (forceLangAr?'ar':lang) as 'en'|'ar';
 const s = STR[lang2];
 const rtl = lang2==='ar';
 const required = ['name','age','weight','height','sex','activity'];
 const supplied = forceTouched || (complete && profile.name.trim().length>0);
 const set = (patch:Partial<typeof DEFAULTS>) => { if(ready){setProfile({...profile,...patch});setResult(null);setMinorNote(false);setGoalOpen(false);setTouched(t=>{const nt={...t,...Object.keys(patch).reduce((a,k)=>{a[k]=true;return a;},{} as Record<string,boolean>)};return nt;});setDeleteNotice(false);} };
 useEffect(()=>{ if(required.every(k=>touched[k])&&profile.name.trim()&&!complete)setComplete(true); },[touched,profile.name]);
 const calculate = () => {
  if(!supplied)return;
  if(profile.age<18){setResult(null);setMinorNote(true);return;}
  const base = 10*profile.weight+6.25*profile.height-5*profile.age;
  const bmr = base+(profile.sex==='male'?5:-161);
  const tdee = bmr*(ACTIVITIES.find(a=>a.value===profile.activity)??ACTIVITIES[2]).factor;
  setResult({bmr,tdee,loss:Math.max(tdee-500,1200),gain:tdee+300,clamped:tdee-500<1200});setMinorNote(false);
 };
 useEffect(()=>{ if(forceTouched)calculate(); },[]);
 const bmi = profile.weight / ((profile.height/100)**2);
 const goalKg = Number(draftGoal.kg);
 const targetWeight = draftGoal.direction==='loss'?profile.weight-goalKg:profile.weight+goalKg;
 const goalValid = draftGoal.direction==='maintain'||(Number.isFinite(goalKg)&&goalKg>0&&targetWeight>0&&(profile.age<20||targetWeight/((profile.height/100)**2)>=18.5));
 const resetAll = () => {setProfile({...DEFAULTS});setGoal({direction:'maintain',kg:''});setResult(null);setMinorNote(false);setGoalOpen(false);setTouched({});setComplete(false);setDeleteNotice(true);};
 const selectedTheme=THEMES.find(t=>t.id===theme)??THEMES[2];
 return <FileCard lang={lang2} dir={rtl?'rtl':'ltr'}><div className={`ef-app ef-${selectedTheme.id}`}>
  <div className="ef-topbar">
   <span className="ef-brandwrap" dir="ltr"><img className="ef-logo" src="./icons/icon-192.png" alt="" width="40" height="40"/><span className="ef-brand" dir="ltr">ELHDAD <span>FIT</span><small>YOUR DAILY BALANCE</small></span></span>
   <span className="ef-topside">
    <button type="button" className="ef-gear" disabled={!themeSaved.ready} onClick={()=>setSettingsOpen(!settingsOpen)} aria-expanded={settingsOpen} aria-label={s.settings}>
     <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    </button>
   </span>
  </div>
  {showInstall&&<div className="ef-install" dir={rtl?'rtl':'ltr'}>
   <svg className="ef-install-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a1 1 0 0 1 1 1v8.6l2.3-2.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4l2.3 2.3V4a1 1 0 0 1 1-1z" fill="currentColor"/><path d="M5 15a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2a1 1 0 1 1 2 0v2a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-2a1 1 0 0 1 1-1z" fill="currentColor"/></svg>
   <div className="ef-install-text"><b>{s.installTitle}</b>
    {isIOS&&!installEvt?<span>{s.installIOS}</span>:<span>{s.installBody}</span>}
   </div>
   {installEvt&&<button className="ef-install-btn" onClick={async()=>{const e=installEvt;setInstallEvt(null);setInstallDismissed(true);e.prompt();try{await e.userChoice;}catch{}}}>{s.installBtn}</button>}
   <button className="ef-install-close" onClick={()=>setInstallDismissed(true)} aria-label={s.installDismiss}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.05 5.64 12 10.59l4.95-4.95a1 1 0 1 1 1.41 1.41L13.41 12l4.95 4.95a1 1 0 0 1-1.41 1.41L12 13.41l-4.95 4.95a1 1 0 0 1-1.41-1.41L10.59 12 5.64 7.05a1 1 0 0 1 1.41-1.41z" fill="currentColor"/></svg>
   </button>
  </div>}
  {settingsOpen&&<div className="ef-settings">
   <span className="ef-settings-label">{s.theme}</span>
   <div className="ef-themes" aria-label={s.theme}>{THEMES.map(t=><FileButton key={t.id} compact variant="ghost" selected={t.id===selectedTheme.id} disabled={!themeSaved.ready} onClick={()=>{setTheme(t.id);}}><span className="ef-swatch" style={{background:t.color}}/><span>{rtl?t.ar:t.en}</span></FileButton>)}</div>
   <ChoiceRow label={s.language} options={[{value:'en',label:'English'},{value:'ar',label:'العربية'}]} value={lang2} onChange={value=>setLang(value as 'en'|'ar')}/>
  </div>}
  <div className="ef-intro"><div className="ef-kicker">{s.kicker}</div><Header title={s.title} intro={s.intro}/><span className="ef-tag">{s.tag}</span></div>
  <div className="ef-layout">
   <section className="ef-form">
    <div className="ef-section-title"><span className="ef-step">01</span><div><h2>{s.sec1h}</h2><p>{s.sec1p}</p></div></div>
    <div className="ef-field ef-name"><TextField label={s.name} value={profile.name} onChange={value=>set({name:value})}/></div>
    <div className="ef-fields">
     <div className="ef-field"><Slider label={s.age} min={13} max={80} value={profile.age} onChange={value=>set({age:value})} describe={s.years}/></div>
     <div className="ef-field"><Slider label={s.weight} min={30} max={200} value={profile.weight} onChange={value=>set({weight:value})} describe={s.kg}/></div>
     <div className="ef-field"><Slider label={s.height} min={120} max={220} value={profile.height} onChange={value=>set({height:value})} describe={s.cm}/></div>
     <div className="ef-field"><ChoiceRow label={s.sex} options={[{value:'male',label:s.male},{value:'female',label:s.female}]} value={profile.sex} onChange={value=>set({sex:value})}/></div>
    </div>
    <div className="ef-field ef-activity"><ChoiceRow label={s.activity} options={ACTIVITIES.map(a=>({value:a.value,label:s.act[a.value]}))} value={profile.activity} onChange={value=>set({activity:value})}/><p className="ef-hint">{s.actHint}</p></div>
    <div className="ef-calculate"><FileButton variant="primary" disabled={!ready||!supplied} onClick={calculate}>{s.calc}</FileButton></div>
    <div className="ef-storage"><Caption>{saved.message||s.storage}</Caption>{themeSaved.message&&themeSaved.message!==saved.message&&<Caption>{themeSaved.message}</Caption>}</div>
   </section>
   <section className="ef-results" aria-live="polite">
    <div className="ef-section-title"><span className="ef-step">02</span><div><h2>{result?(profile.name.trim()?s.resName(profile.name.trim()):s.res):s.res}</h2><p>{s.perDay}</p></div></div>
    {!result&&!minorNote?null:minorNote?<div className="ef-note"><h3>{s.minorH}</h3><p>{s.minorP}</p></div>:<div className="ef-stats">{[
     {label:s.gain,value:result?.gain,detail:s.gainD,icon:'+'},
     {label:s.maintain,value:result?.tdee,detail:s.maintainD,main:true,icon:'='},
     {label:s.lose,value:result?.loss,detail:result?.clamped?s.loseFloorD:s.loseD,icon:'−'}
    ].map((s2,i)=><div key={s2.label} className={`ef-stat ${s2.main?'ef-stat-main':''}`}><div className="ef-stat-top"><span>{s2.label}</span><span className="ef-stat-icon">{s2.icon}</span></div><strong>{s2.value!==undefined?fmt(s2.value):'···'}</strong><p>{s2.detail}</p></div>)}</div>}
    {result&&<div className="ef-bmr"><span>{s.bmr} <bdi>BMR</bdi></span><strong>{fmt(result.bmr)}</strong></div>}
    {!result&&!minorNote&&<p className="ef-hint ef-empty">{s.emptyHint}</p>}
    <p className="ef-disclaimer">{s.disclaimer}</p>
    {result?.clamped&&<div className="ef-note">{s.clamped}</div>}
   </section>
  </div>
  {result&&<section className="ef-goal-section">
   <div className="ef-section-title"><span className="ef-step">03</span><div><h2>{s.sec3h}</h2><p>{s.sec3p}</p></div></div>
   <div className="ef-goal-guidance">{profile.age<20?<p>{s.teen}</p>:<><p>{s.bmiLabel} <bdi>BMI {bmi.toFixed(1)}</bdi> · {bmi<18.5?s.bmiBelow:bmi<25?s.bmiWithin:s.bmiAbove}</p><p>{bmi<18.5?s.bmiBelowP:bmi<25?s.bmiWithinP:s.bmiAboveP} {s.bmiNote}</p></>}</div>
   <button type="button" className="ef-goal-toggle" aria-expanded={goalOpen} onClick={()=>{setDraftGoal({...goal});setGoalOpen(true);goalDialog.current?.showModal();}}>{s.setGoal} <span aria-hidden="true">+</span></button>
   <dialog ref={goalDialog} className="ef-confirm ef-goal-dialog" aria-labelledby="ef-goal-title" onClose={()=>setGoalOpen(false)}><CloseButton label={s.close} onClick={()=>goalDialog.current?.close()}/><div className="ef-reset-kicker" dir="ltr">{s.fine}</div><h2 id="ef-goal-title">{s.goalTitle}</h2><div className="ef-goal-editor"><ChoiceRow label={s.direction} options={[{value:'maintain',label:s.maintainOpt},{value:'loss',label:s.lossOpt},{value:'gain',label:s.gainOpt}]} value={draftGoal.direction} onChange={direction=>{if(goalSaved.ready)setDraftGoal({...draftGoal,direction});}}/>
    {draftGoal.direction!=='maintain'&&<div className="ef-goal-input"><label htmlFor="ef-goal-kg">{draftGoal.direction==='loss'?s.kgLossL:s.kgGainL}</label><input id="ef-goal-kg" type="number" inputMode="decimal" min="0.1" step="0.1" placeholder={draftGoal.direction==='loss'?s.kgLossPh:s.kgGainPh} value={draftGoal.kg} disabled={!goalSaved.ready} onChange={e=>setDraftGoal({...draftGoal,kg:e.target.value})}/></div>}
    {draftGoal.direction==='maintain'?<p className="ef-goal-status">{s.goalMaintain}</p>:draftGoal.kg!==''&&<p className="ef-goal-status" role="status">{goalValid?s.goalChoice(draftGoal.direction,goalKg.toLocaleString('en-US')):s.goalInvalid}</p>}
    <p className="ef-hint">{s.goalHint}</p><Caption>{goalSaved.message}</Caption>
   </div><div className="ef-goal-dialog-actions"><button type="button" className="ef-goal-cancel" onClick={()=>goalDialog.current?.close()}>{s.cancel}</button><button type="button" className="ef-goal-save" disabled={!goalSaved.ready||!goalValid} onClick={()=>{setGoal({...draftGoal});goalDialog.current?.close();}}>{s.saveGoal}</button></div></dialog>
  </section>}
  <div className="ef-delete-area"><button type="button" className="ef-delete" disabled={!ready||!goalSaved.ready||!themeSaved.ready} onClick={resetAll}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>{s.deleteAll}</button>{deleteNotice&&<p role="status">{s.deleted}</p>}</div>
  <details className="ef-method"><summary>{s.method}</summary><p>{s.methodP}</p><TextLink href="https://www.healthline.com/health/how-to-calculate-your-basal-metabolic-rate">Equation and activity factors, Healthline</TextLink><br/><TextLink href="https://www.mayoclinic.org/healthy-lifestyle/weight-loss/in-depth/calories/art-20048065">Calories and weight loss, Mayo Clinic</TextLink><br/><TextLink href="https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html">Adult BMI categories, ages 20+, CDC</TextLink><br/><TextLink href="https://www.cdc.gov/bmi/child-teen-calculator/">Weight assessment through age 19, CDC</TextLink></details>
  <Closing><span className="ef-footer-brand" dir="ltr">Elhdad Fit</span> · {s.closing}</Closing>
 </div></FileCard>;
}
