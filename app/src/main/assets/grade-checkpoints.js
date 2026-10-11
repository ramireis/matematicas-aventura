window.MZGradeCheckpoint=function(state,shuffle){
 const Q=(topic,q,a,c,resolution)=>({topic,q,a,c:[...new Set(c)],resolution});
 const N=(a,d=1)=>shuffle([...new Set([a,a+d,a-d,a+d*2])]);
 const g=state.grade,w=state.island,out=[];
 for(let i=0;i<10;i++){
  if(g===2){
   if(w===1){let a=4+i,b=3+i%4,r=a+b;out.push(Q('Sumas hasta 20',`Calcula: ${a} + ${b}`,r,N(r),`${a}+${b}=${r}.`))}
   else if(w===2){let a=12+i*2,b=5+i%5,r=a+b;out.push(Q('Sumas hasta 50',`Calcula: ${a} + ${b}`,r,N(r,2),`${a}+${b}=${r}.`))}
   else if(w===3){let a=28+i*2,b=5+i%6,r=a-b;out.push(Q('Restas hasta 50',`Calcula: ${a} − ${b}`,r,N(r),`${a}−${b}=${r}.`))}
   else if(w===4){let a=35+i*3,b=12+i%6,r=a+b;out.push(Q('Sumas hasta 100',`Calcula: ${a} + ${b}`,r,N(r,5),`${a}+${b}=${r}.`))}
   else if(w===5){let a=70+i*2,b=15+i%8,r=a-b;out.push(Q('Restas hasta 100',`Calcula: ${a} − ${b}`,r,N(r,4),`${a}−${b}=${r}.`))}
   else{let a=30+i*3,b=8+i%5,sum=a+b,r=i%2===0?sum:sum-b;out.push(Q('Sumas y restas hasta 100',i%2===0?`Ana tenía ${a} fichas y recibió ${b}. ¿Cuántas tiene?`:`Había ${sum} globos y se usaron ${b}. ¿Cuántos quedan?`,r,N(r,3),'Identifica si la situación agrega o quita y realiza la operación.'))}
  }else if(g===3){
   if(w===1){let a=125+i*11,b=203+i*7,r=a+b;out.push(Q('Sumas hasta 999',`Calcula: ${a} + ${b}`,r,N(r,10),`${a}+${b}=${r}.`))}
   else if(w===2){let a=12000+i*731,b=23000+i*419,r=a+b;out.push(Q('Sumas hasta 99 999',`Calcula: ${a} + ${b}`,r,N(r,100),`Suma por valor posicional: ${r}.`))}
   else if(w===3){let a=210000+i*21000,b=125000+i*13000,r=a+b;out.push(Q('Sumas hasta 1 000 000',`Calcula: ${a} + ${b}`,r,N(r,1000),`Alinea las cifras y suma: ${r}.`))}
   else if(w===4){let a=850000-i*17000,b=123000+i*3000,r=a-b;out.push(Q('Restas hasta 1 000 000',`Calcula: ${a} − ${b}`,r,N(r,1000),`Alinea las cifras y resta: ${r}.`))}
   else if(w===5){let a=2+i%13,b=3+(i*2)%12,r=a*b;out.push(Q('Tablas del 1 al 14',`Calcula: ${a} × ${b}`,r,N(r,a),`${a} grupos de ${b} son ${r}.`))}
   else{let d=2+i%13,c=2+(i*3)%12,v=d*c;out.push(Q('Divisiones inversas',`Calcula: ${v} ÷ ${d}`,c,N(c),`Como ${d}×${c}=${v}, el cociente es ${c}.`))}
  }else if(g===7){
   if(w===1){if(i%2===0){let kg=2+i,r=kg*1000;out.push(Q('Masa',`¿Cuántos gramos hay en ${kg} kg?`,r,N(r,1000),'1 kg equivale a 1000 g.'))}else out.push(Q('Cuerpos geométricos','¿Qué cuerpo tiene dos bases circulares y una superficie curva?','Cilindro',['Cilindro','Cono','Esfera','Prisma'],'El cilindro posee dos bases circulares.'))}
   else if(w===2){let t=2+i%4,r=t*2;out.push(Q('Proporcionalidad inversa',`${t} trabajadores tardan 24 horas. Si trabajan ${r}, ¿cuántas horas tardan al mismo ritmo?`,12,[12,24,48,6],'Al duplicar trabajadores, el tiempo se reduce a la mitad.'))}
   else if(w===3){let p=[10,20,25,50,75][i%5],r=200*p/100;out.push(Q('Porcentajes',`¿Cuánto es ${p}% de 200?`,r,N(r,10),`200×${p}/100=${r}.`))}
   else if(w===4){let price=40+i*5,p=[10,15,20,25][i%4],disc=price*p/100,r=price-disc;out.push(Q('Rebajas',`Un artículo cuesta $${price} y tiene ${p}% de descuento. ¿Cuál es el precio final?`,r,N(r,5),`Descuento: ${disc}; precio final: ${r}.`))}
   else if(w===5){let l=4+i,r=l*4;out.push(Q('Perímetro',`¿Cuál es el perímetro de un cuadrado de lado ${l} cm?`,r,N(r,4),`Perímetro=4×lado=${r} cm.`))}
   else{let a=10+i,b=12+i,c=14+i,r=(a+b+c)/3;out.push(Q('Media aritmética',`Calcula la media de ${a}, ${b} y ${c}.`,r,N(r,2),`Suma los datos y divide para 3: ${r}.`))}
  }
 }
 return shuffle(out).slice(0,10);
};