import React from 'react';

export default function SplashScreen({ show }) {
  if (!show) return null;

  return (
    <>
      <style>{`
        #_splash { position:fixed; inset:0; z-index:999999; background:#94272C; display:flex; align-items:center; justify-content:center; overflow:hidden; transition:opacity .5s ease; pointer-events:none; }
        #_splash-inner { display:flex; flex-direction:column; align-items:center; gap:18px; position:relative; z-index:2; animation:_sPopIn .65s cubic-bezier(.34,1.56,.64,1) forwards; }
        #_splash-ring { position:relative; width:120px; height:120px; display:flex; align-items:center; justify-content:center; }
        #_splash-ring-border { position:absolute; inset:0; border-radius:50%; border:2.5px solid rgba(255,255,255,.35); border-top-color:white; animation:_sSpin 1.4s linear infinite; }
        #_splash-logo-bg { width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,.15); display:flex; align-items:center; justify-content:center; }
        #_splash-logo-bg img { width:64px; height:64px; object-fit:contain; }
        #_splash-title { color:white; font-size:1.9rem; font-weight:900; letter-spacing:-.5px; font-family:Lexend,Montserrat,sans-serif; margin:0; animation:_sFadeUp .5s ease .35s both; }
        #_splash-sub { color:rgba(255,255,255,.65); font-size:.72rem; font-weight:600; letter-spacing:3.5px; text-transform:uppercase; font-family:Lexend,Montserrat,sans-serif; margin:-10px 0 0; animation:_sFadeUp .5s ease .55s both; }
        #_splash-dots { display:flex; gap:8px; margin-top:6px; animation:_sFadeUp .5s ease .7s both; }
        .splash-dot { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,.4); }
        .splash-dot:nth-child(1){animation:_sBounce 1.1s ease infinite 0s}
        .splash-dot:nth-child(2){animation:_sBounce 1.1s ease infinite .18s}
        .splash-dot:nth-child(3){animation:_sBounce 1.1s ease infinite .36s}
        ._sc{position:absolute;border-radius:50%;background:rgba(255,100,100,.18)}
        ._sc-tr{width:360px;height:360px;top:-130px;right:-130px}
        ._sc-bl{width:300px;height:300px;bottom:-110px;left:-110px}
        @keyframes _sPopIn{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}
        @keyframes _sFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes _sSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes _sBounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-8px);opacity:1;background:white}}
        @keyframes bannerSlideIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div id="_splash">
        <div className="_sc _sc-tr" />
        <div className="_sc _sc-bl" />
        <div id="_splash-inner">
          <div id="_splash-ring">
            <div id="_splash-ring-border" />
            <div id="_splash-logo-bg">
              <img src="/imgs/yameharte.png" alt="CBTis 258" />
            </div>
          </div>
          <p id="_splash-title">CBTis 258</p>
          <p id="_splash-sub">Un motivo de orgullo</p>
          <div id="_splash-dots">
            <div className="splash-dot" />
            <div className="splash-dot" />
            <div className="splash-dot" />
          </div>
        </div>
      </div>
    </>
  );
}
