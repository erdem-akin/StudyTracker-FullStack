import { useState, useEffect } from 'react'

function App() {
  const [ekran, setEkran] = useState("login")
  const [aktifKullanici, setAktifKullanici] = useState(null)
  const [hosgeldinMesaji, setHosgeldinMesaji] = useState("")

  const [ad, setAd] = useState("")
  const [email, setEmail] = useState("")
  const [sifre, setSifre] = useState("")
  const [hataMesaji, setHataMesaji] = useState("")

  const [dersAdi, setDersAdi] = useState("")
  const [kredi, setKredi] = useState("")
  
  // Tekrar dersi durumu
  const [isTekrar, setIsTekrar] = useState(false)

  const [seciliDersId, setSeciliDersId] = useState(null)
  const [notIsmi, setNotIsmi] = useState("")
  const [notPuani, setNotPuani] = useState("")
  const [notAgirligi, setNotAgirligi] = useState("")

  const [gecmisKredi, setGecmisKredi] = useState("")
  const [gecmisPuan, setGecmisPuan] = useState("")
  const [dersListesi, setDersListesi] = useState([]) 

  useEffect(() => {
    const kayitliUser = localStorage.getItem("studyTrackerUser");
    if (kayitliUser) {
      const user = JSON.parse(kayitliUser);
      setAktifKullanici(user);
      setEkran("dersler");
      setHosgeldinMesaji(`Tekrar Hoşgeldin, ${user.username} 👋`);
      verileriGetir(user.id);
    }
  }, []);

  const puanHesapla = (ortalama) => {
    const yuvarlanmis = Math.round(ortalama);
    if (yuvarlanmis >= 96) return { harf: "A+", katsayi: 4.00, renk: "#4caf50", not: yuvarlanmis };
    if (yuvarlanmis >= 90) return { harf: "A",  katsayi: 3.75, renk: "#66bb6a", not: yuvarlanmis };
    if (yuvarlanmis >= 84) return { harf: "A-", katsayi: 3.50, renk: "#81c784", not: yuvarlanmis };
    if (yuvarlanmis >= 80) return { harf: "B+", katsayi: 3.25, renk: "#42a5f5", not: yuvarlanmis };
    if (yuvarlanmis >= 76) return { harf: "B",  katsayi: 3.00, renk: "#64b5f6", not: yuvarlanmis };
    if (yuvarlanmis >= 72) return { harf: "B-", katsayi: 2.75, renk: "#90caf9", not: yuvarlanmis };
    if (yuvarlanmis >= 68) return { harf: "C+", katsayi: 2.50, renk: "#ff9800", not: yuvarlanmis };
    if (yuvarlanmis >= 64) return { harf: "C",  katsayi: 2.25, renk: "#ffb74d", not: yuvarlanmis };
    if (yuvarlanmis >= 60) return { harf: "C-", katsayi: 2.00, renk: "#ffcc80", not: yuvarlanmis };
    if (yuvarlanmis >= 55) return { harf: "D+", katsayi: 1.75, renk: "#ff5722", not: yuvarlanmis };
    if (yuvarlanmis >= 50) return { harf: "D",  katsayi: 1.50, renk: "#ff7043", not: yuvarlanmis };
    return { harf: "F", katsayi: 0.00, renk: "#d32f2f", not: yuvarlanmis };
  };

  const kalanPuanHesapla = (ders) => {
    let suankiPuan = 0;
    let girilenYuzde = 0;
    ders.notlar.forEach(n => {
      suankiPuan += (n.score * n.weight) / 100;
      girilenYuzde += n.weight;
    });

    const kalanYuzde = 100 - girilenYuzde;
    if (kalanYuzde <= 0) return null;

    let gerekenNot = (50 - suankiPuan) * (100 / kalanYuzde);
    
    // Baraj kontrolü: Okulunda final min 40
    if (gerekenNot < 40) gerekenNot = 40;

    if (gerekenNot > 100) return { mumkun: false, not: Math.ceil(gerekenNot) };
    return { mumkun: true, not: Math.ceil(gerekenNot), kalanYuzde: kalanYuzde };
  };

  const kayitOl = async () => {
    if (!ad || !email || !sifre) return setHataMesaji("Tüm alanları doldur!");
    try {
      const res = await fetch("http://127.0.0.1:8001/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: ad, email: email, password: sifre }) });
      if (res.ok) { alert("Kayıt başarılı!"); setEkran("login"); setHataMesaji(""); } else { const data = await res.json(); setHataMesaji(data.detail); }
    } catch (e) { setHataMesaji("Sunucu hatası!"); }
  }

  const girisYap = async () => {
    if (!email || !sifre) return setHataMesaji("Giriş yap!");
    try {
      const res = await fetch("http://127.0.0.1:8001/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email, password: sifre }) });
      if (res.ok) {
        const user = await res.json(); setAktifKullanici(user); localStorage.setItem("studyTrackerUser", JSON.stringify(user));
        setEkran("dersler"); setHosgeldinMesaji(`Hoşgeldin, ${user.username} 🚀`); verileriGetir(user.id); setHataMesaji("");
      } else { setHataMesaji("Hatalı giriş!"); }
    } catch (e) { setHataMesaji("Sunucu yok!"); }
  }

  const cikisYap = () => { setAktifKullanici(null); setEkran("login"); setDersListesi([]); localStorage.removeItem("studyTrackerUser"); setEmail(""); setSifre(""); }

  const verileriGetir = async (userId) => {
    try {
      const [kurslar, notlar] = await Promise.all([
        (await fetch("http://127.0.0.1:8001/courses?t="+Date.now())).json(),
        (await fetch("http://127.0.0.1:8001/grades?t="+Date.now())).json()
      ]);
      const benimkiler = kurslar.filter(k => k.owner_id === userId);
      const islenmisVeri = benimkiler.map(kurs => {
        const buDersinNotlari = notlar.filter(n => n.course_id === kurs.id);
        let toplamPuan = 0; let toplamYuzde = 0;
        buDersinNotlari.forEach(n => { toplamPuan += (n.score * n.weight); toplamYuzde += n.weight; });
        const hamOrtalama = toplamYuzde > 0 ? (toplamPuan / 100) : 0;
        const harfBilgisi = puanHesapla(hamOrtalama);
        
        const tekrarMi = kurs.description === "TEKRAR";

        return { 
          ...kurs, notlar: buDersinNotlari, ortalama: harfBilgisi.not, harf: harfBilgisi.harf, katsayi: harfBilgisi.katsayi, renk: harfBilgisi.renk, toplamYuzde: toplamYuzde, tekrar: tekrarMi 
        };
      });
      setDersListesi(islenmisVeri);
    } catch (e) { console.error(e); }
  };

  const dersEkle = async () => {
    if (!dersAdi || !kredi) return alert("Eksik bilgi!");
    const desc = isTekrar ? "TEKRAR" : "";
    await fetch("http://127.0.0.1:8001/courses", { 
      method: "POST", headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ name: dersAdi, description: desc, user_id: aktifKullanici.id, credit: Number(kredi) }) 
    });
    verileriGetir(aktifKullanici.id); setDersAdi(""); setKredi(""); setIsTekrar(false);
  }

  const dersSil = async (id) => { if(confirm("Ders silinsin mi?")) { await fetch(`http://127.0.0.1:8001/courses/${id}`, { method: "DELETE" }); verileriGetir(aktifKullanici.id); } }
  
  const notEkle = async () => {
    if (!notIsmi || !notPuani || !notAgirligi) return alert("Doldur!");
    const ders = dersListesi.find(d => d.id === seciliDersId);
    if (ders.toplamYuzde + Number(notAgirligi) > 100) return alert("Hata: %100'ü geçemez!");
    await fetch("http://127.0.0.1:8001/grades", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: notIsmi, score: Number(notPuani), weight: Number(notAgirligi), course_id: seciliDersId }) });
    setNotIsmi(""); setNotPuani(""); setNotAgirligi(""); verileriGetir(aktifKullanici.id);
  }
  const notSil = async (id) => { await fetch(`http://127.0.0.1:8001/grades/${id}`, { method: "DELETE" }); verileriGetir(aktifKullanici.id); }

  const yano = () => { let kr=0, pn=0; dersListesi.forEach(d=>{kr+=d.credit; pn+=(d.katsayi*d.credit)}); return kr===0 ? "0.00" : (pn/kr).toFixed(2); }
  
  const gano = () => { 
    let donemKredi=0, donemPuan=0; 
    dersListesi.forEach(d => {
      if (!d.tekrar) { donemKredi += d.credit; } // Tekrar dersinin kredisini ekleme (zaten geçmişte var)
      donemPuan += (d.katsayi * d.credit);
    });
    const tk = Number(gecmisKredi) + donemKredi; 
    const tp = Number(gecmisPuan) + donemPuan; 
    return tk===0 ? "0.00" : (tp/tk).toFixed(2); 
  }

  const inputStili = { padding: "12px", borderRadius: "8px", border: "1px solid #444", backgroundColor: "#222", color: "white", width: "100%", outline:"none", marginBottom:"10px" };
  const btnStil = { padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", color:"white", width:"100%" };

  if (ekran === "login" || ekran === "register") return (
    <div style={{height:"100vh", backgroundColor:"#1e2127", color:"white", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column"}}>
      <h1 style={{fontSize:"3rem", marginBottom:"10px"}}>🎓 StudyTracker</h1>
      <div style={{backgroundColor:"#2c313a", padding:"40px", borderRadius:"20px", width:"350px", boxShadow:"0 10px 30px rgba(0,0,0,0.5)"}}>
        <div style={{display:"flex", marginBottom:"20px", borderBottom:"1px solid #444"}}>
          <button onClick={()=>{setEkran("login"); setHataMesaji("")}} style={{flex:1, background:"none", border:"none", color: ekran==="login"?"#61dafb":"#aaa", padding:"10px", fontWeight:"bold", borderBottom: ekran==="login"?"2px solid #61dafb":"none", cursor:"pointer"}}>GİRİŞ YAP</button>
          <button onClick={()=>{setEkran("register"); setHataMesaji("")}} style={{flex:1, background:"none", border:"none", color: ekran==="register"?"#61dafb":"#aaa", padding:"10px", fontWeight:"bold", borderBottom: ekran==="register"?"2px solid #61dafb":"none", cursor:"pointer"}}>KAYIT OL</button>
        </div>
        {hataMesaji && <div style={{backgroundColor:"#d32f2f", color:"white", padding:"10px", borderRadius:"5px", marginBottom:"15px", fontSize:"14px"}}>{hataMesaji}</div>}
        {ekran === "register" && <input placeholder="Adın Soyadın" value={ad} onChange={e=>setAd(e.target.value)} style={inputStili}/>}
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={inputStili}/>
        <input type="password" placeholder="Şifre" value={sifre} onChange={e=>setSifre(e.target.value)} style={inputStili}/>
        {ekran === "login" ? (<button onClick={girisYap} style={{...btnStil, backgroundColor:"#61dafb", color:"#000"}}>GİRİŞ YAP</button>) : (<button onClick={kayitOl} style={{...btnStil, backgroundColor:"#4caf50", color:"white"}}>KAYIT OL</button>)}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh", backgroundColor:"#1e2127", color:"white", padding:"20px", fontFamily:"sans-serif", display:"flex", flexDirection:"column", alignItems:"center"}}>
      <div style={{width:"100%", maxWidth:"800px", display:"flex", justifyContent:"space-between", marginBottom:"20px", borderBottom:"1px solid #333", paddingBottom:"10px"}}>
        <h3 style={{margin:0}}>{hosgeldinMesaji}</h3>
        <button onClick={cikisYap} style={{background:"transparent", border:"1px solid #d32f2f", color:"#d32f2f", padding:"5px 15px", borderRadius:"5px", cursor:"pointer"}}>Çıkış Yap</button>
      </div>

      <div style={{width:"100%", maxWidth:"800px", display:"flex", gap:"20px", marginBottom:"30px", flexWrap:"wrap"}}>
        <div style={{flex:1, background:"#2c313a", padding:"20px", borderRadius:"15px"}}>
          <h4 style={{marginTop:0, color:"#61dafb"}}>Geçmiş Verilerin</h4>
          <div style={{display:"flex", gap:"10px"}}>
            <div><small>Geçmiş Kredi</small><input type="number" placeholder="0" value={gecmisKredi} onChange={e=>setGecmisKredi(e.target.value)} style={{...inputStili, padding:"5px"}}/></div>
            <div><small>Geçmiş Puan</small><input type="number" placeholder="0" value={gecmisPuan} onChange={e=>setGecmisPuan(e.target.value)} style={{...inputStili, padding:"5px"}}/></div>
          </div>
        </div>
        <div style={{flex:1, display:"flex", gap:"10px"}}>
          <div style={{flex:1, background:"linear-gradient(135deg, #FF9800, #F44336)", borderRadius:"15px", padding:"10px", textAlign:"center", display:"flex", flexDirection:"column", justifyContent:"center"}}><small>YANO</small><h1>{yano()}</h1></div>
          <div style={{flex:1, background:"linear-gradient(135deg, #2196F3, #3F51B5)", borderRadius:"15px", padding:"10px", textAlign:"center", display:"flex", flexDirection:"column", justifyContent:"center"}}><small>GANO</small><h1>{gano()}</h1></div>
        </div>
      </div>

      <div style={{width:"100%", maxWidth:"800px", background:"#2c313a", padding:"20px", borderRadius:"15px", marginBottom:"20px", display:"flex", gap:"10px", flexDirection:"column"}}>
        <div style={{display:"flex", gap:"10px"}}>
          <input placeholder="Ders Adı" value={dersAdi} onChange={e=>setDersAdi(e.target.value)} style={{...inputStili, marginBottom:0, flex:3}}/>
          <input type="number" placeholder="Kredi" value={kredi} onChange={e=>setKredi(e.target.value)} style={{...inputStili, marginBottom:0, flex:1}}/>
          <button onClick={dersEkle} style={{...btnStil, width:"auto", backgroundColor:"#4caf50", padding:"0 20px"}}>EKLE</button>
        </div>
        {/* 🔥 DÜZELTİLDİ: Artık FF/DD yok, F/D yazıyor */}
        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
          <input type="checkbox" id="tekrarCheck" checked={isTekrar} onChange={e=>setIsTekrar(e.target.checked)} style={{width:"20px", height:"20px", cursor:"pointer"}}/>
          <label htmlFor="tekrarCheck" style={{fontSize:"14px", color:"#aaa", cursor:"pointer"}}>Bu bir tekrar dersi (F/D yükseltme)</label>
        </div>
      </div>

      <div style={{width:"100%", maxWidth:"800px"}}>
        {dersListesi.map(d=>(
          <div key={d.id} style={{background:"#2c313a", borderRadius:"10px", marginBottom:"15px", overflow:"hidden", boxShadow:"0 4px 10px rgba(0,0,0,0.3)"}}>
            <div style={{padding:"15px", borderLeft:`6px solid ${d.renk}`, background:"#333842", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>
                <h3 style={{margin:0}}>{d.ad} {d.tekrar && <span style={{fontSize:"10px", background:"#e91e63", padding:"2px 5px", borderRadius:"4px", color:"white", marginLeft:"5px"}}>TEKRAR</span>}</h3>
                <small style={{color:"#aaa"}}>{d.credit} Kredi • Tamamlanan: %{d.toplamYuzde}</small>
              </div>
              <div style={{textAlign:"right"}}>
                <h2 style={{margin:0, color:d.renk}}>{d.harf}</h2>
                <small style={{fontSize:"11px", color:"#ccc"}}>Not: <b>{d.ortalama}</b> | Ort: <b>{d.katsayi.toFixed(2)}</b></small> 
                <button onClick={()=>dersSil(d.id)} style={{background:"none", border:"none", cursor:"pointer", marginLeft:"10px"}}>🗑️</button>
              </div>
            </div>
            <div style={{padding:"15px", background:"#252930"}}>
              {d.notlar.map(n=>( <div key={n.id} style={{display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #333", fontSize:"14px"}}><span>{n.name} (%{n.weight})</span><span><b>{n.score}</b> <span onClick={()=>notSil(n.id)} style={{color:"#d32f2f", cursor:"pointer", marginLeft:"10px"}}>x</span></span></div> ))}
              
              {(() => {
                const hesap = kalanPuanHesapla(d);
                if (hesap && d.toplamYuzde < 100) {
                  return (
                    <div style={{marginTop:"10px", padding:"10px", backgroundColor: hesap.mumkun ? "#283593" : "#c62828", borderRadius:"8px", fontSize:"13px", display:"flex", alignItems:"center", gap:"10px"}}>
                      <span style={{fontSize:"20px"}}>🎯</span>
                      <div>
                        {hesap.mumkun ? (
                          <>Geçmek için (50 Ort) kalan %{hesap.kalanYuzde}'lik sınavdan <b>en az {hesap.not}</b> alman lazım.</>
                        ) : (
                          <>Maalesef, kalan sınavdan 100 bile alsan 50 ortalamayı geçemiyorsun ({hesap.not} gerekiyor).</>
                        )}
                        {hesap.not === 40 && hesap.mumkun && <div style={{fontSize:"11px", opacity:0.8}}>(Not: Puanın yetse de baraj kuralı gereği min 40 şart)</div>}
                      </div>
                    </div>
                  )
                }
              })()}

              {d.toplamYuzde < 100 ? (
                <div style={{marginTop:"10px", display:"flex", gap:"5px"}}>
                  <input placeholder="Vize/Final" value={seciliDersId===d.id?notIsmi:""} onChange={e=>{setSeciliDersId(d.id); setNotIsmi(e.target.value)}} style={{...inputStili, marginBottom:0, padding:"5px"}}/>
                  <input type="number" placeholder="Not" value={seciliDersId===d.id?notPuani:""} onChange={e=>{setSeciliDersId(d.id); setNotPuani(e.target.value)}} style={{...inputStili, marginBottom:0, width:"60px", padding:"5px"}}/>
                  <input type="number" placeholder="%" value={seciliDersId===d.id?notAgirligi:""} onChange={e=>{setSeciliDersId(d.id); setNotAgirligi(e.target.value)}} style={{...inputStili, marginBottom:0, width:"50px", padding:"5px"}}/>
                  <button onClick={()=>{setSeciliDersId(d.id); notEkle()}} style={{...btnStil, width:"auto", backgroundColor:"#61dafb", color:"black"}}>+</button>
                </div>
              ) : (
                <div style={{marginTop:"10px", padding:"10px", backgroundColor:"#1b5e20", color:"#a5d6a7", borderRadius:"8px", textAlign:"center", fontSize:"14px", fontWeight:"bold"}}>✅ Not girişi tamamlandı (%100)</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default App;
// UI components initialized