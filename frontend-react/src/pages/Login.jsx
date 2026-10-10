import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    registerSendOTP,
    registerVerifyOTP,
    loginUser,
    loginWithGoogleToken,
    checkSessionToken,
    checkBackendHealth,
    sendForgotPasswordLink,
} from "../api/auth";
import { useAuth } from "../hooks/useAuth";
import { showToast } from "../utils/toast";
import { useCustomization } from "../hooks/useCustomization";
import { createBrandBackground } from "../utils/branding";

const GOOGLE_CLIENT_ID =
    "518151220144-9bvr54odrsmi1lccf27eok450e15tfor.apps.googleusercontent.com";

// ── Componente OTP Modal ──
function OtpModal({ isOpen, onClose, email, userParams, navigate, onAuthenticated }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(120);
    const [verifying, setVerifying] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!isOpen) return;
        // Reinicializa el código cada vez que se abre el modal.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOtp(["", "", "", "", "", ""]);
        setTimeLeft(120);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(timer);
    }, [isOpen, timeLeft]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value.slice(0, 1);
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData("text")
            .trim()
            .replace(/[^0-9]/g, "")
            .slice(0, 6);
        if (pasted) {
            const newOtp = [...otp];
            pasted.split("").forEach((c, i) => {
                if (i < 6) newOtp[i] = c;
            });
            setOtp(newOtp);
            const next = Math.min(pasted.length, 5);
            inputRefs.current[next]?.focus();
        }
    };

    const isComplete = otp.every((d) => d !== "");

    const handleVerify = async () => {
        if (!isComplete || verifying) return;
        setVerifying(true);
        try {
            const code = otp.join("");
            const response = await registerVerifyOTP(email, code);
            const data = await response.json();
            if (response.ok) {
                const userProfile = {
                    id: data.user.id,
                    email: data.user.email,
                    nombre: userParams.nombre,
                    rol: userParams.rol,
                    semestre: userParams.semestre,
                };
                onAuthenticated(userProfile, data.access_token);
                localStorage.setItem(
                    `perfil_${data.user.id}`,
                    JSON.stringify(userProfile),
                );
                showToast("¡Cuenta creada exitosamente! 🎉", "success");
                onClose();
                localStorage.setItem("just_registered", "true");
                setTimeout(() => navigate("/principal"), 1000);
            } else {
                showToast(
                    data.detail || "Código incorrecto o expirado",
                    "error",
                );
            }
        } catch {
            showToast("Error de conexión", "error");
        } finally {
            setVerifying(false);
        }
    };

    if (!isOpen) return null;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return (
        <div className="fixed inset-0 w-full h-full bg-black/50 z-[9999] flex justify-center items-center backdrop-blur-sm px-4">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="bg-gradient-to-r from-primary to-red-700 px-6 py-5 text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span
                            className="material-symbols-outlined text-white"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            lock_open
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-white">
                        Verificación de Cuenta
                    </h2>
                </div>
                <div className="p-6">
                    <p className="text-slate-600 dark:text-slate-400 text-center mb-6 text-sm">
                        Hemos enviado un código de 6 dígitos a tu correo
                        institucional.
                    </p>
                    <div className="flex justify-between items-center gap-1 md:gap-2 mb-6">
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                type="text"
                                maxLength="1"
                                value={digit}
                                ref={(el) => (inputRefs.current[i] = el)}
                                onChange={(e) =>
                                    handleOtpChange(i, e.target.value)
                                }
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                onPaste={i === 0 ? handlePaste : undefined}
                                className="w-10 h-12 md:w-12 md:h-14 text-center text-xl font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                        ))}
                    </div>
                    <div className="flex flex-col gap-4">
                        <button
                            type="button"
                            onClick={handleVerify}
                            disabled={!isComplete || verifying}
                            className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <span className="material-symbols-outlined">
                                verified_user
                            </span>
                            {verifying ? "Verificando..." : "Verificar Código"}
                        </button>
                        <div className="text-center">
                            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                El código expira en:{" "}
                                <span className="font-bold text-primary">
                                    {`0${mins}:${secs < 10 ? "0" : ""}${secs}`}
                                </span>
                            </div>
                            <button
                                type="button"
                                disabled={timeLeft > 0}
                                className="text-sm text-slate-400 font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ¿No recibiste el código? Reenviar
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
                            >
                                Cancelar registro
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Componente Forgot Password Modal ──
function ForgotModal({ isOpen, onClose, onGoToSignup }) {
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!email.trim()) {
            showToast("Por favor ingresa tu email", "warning");
            return;
        }
        setSending(true);
        try {
            await sendForgotPasswordLink(email);
            showToast(
                "Si el correo existe, recibirás un email con instrucciones",
                "success",
            );
            onClose();
            setEmail("");
        } catch {
            showToast("Error de conexión con el servidor", "error");
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 w-full h-full bg-black/50 z-[9999] flex justify-center items-center backdrop-blur-sm px-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                    setEmail("");
                }
            }}
        >
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="bg-gradient-to-r from-primary to-orange-600 px-6 py-5 text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span
                            className="material-symbols-outlined text-white"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            password
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-white">
                        ¿Olvidaste tu contraseña?
                    </h2>
                </div>
                <div className="p-6">
                    <p className="text-slate-600 dark:text-slate-400 text-center mb-6 text-sm">
                        Ingresa tu correo y te enviaremos instrucciones para
                        recuperarla.
                    </p>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSend();
                            }}
                            className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="ejemplo@cbtis258.edu.mx"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                    >
                        {sending ? "Enviando..." : "Enviar Instrucciones"}
                    </button>
                    <p className="text-center text-sm mt-3 text-slate-600 dark:text-slate-400">
                        ¿No tienes una cuenta?{" "}
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onClose();
                                onGoToSignup();
                            }}
                            className="text-primary font-bold hover:underline"
                        >
                            Regístrate ahora
                        </a>
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        onClose();
                        setEmail("");
                    }}
                    className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        </div>
    );
}

// ── Página Login Principal ──
export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { getCustomization } = useCustomization();
    const previewRequested = new URLSearchParams(window.location.search).get("preview") === "1";
    const previewId = new URLSearchParams(window.location.search).get("previewId");
    const [isActive, setIsActive] = useState(false);
    const [previewAllowed, setPreviewAllowed] = useState(false);
    const [previewTheme, setPreviewTheme] = useState(null);
    const [showForgot, setShowForgot] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otpEmail, setOtpEmail] = useState("");
    const [otpUserParams, setOtpUserParams] = useState({});

    // Form states - Login
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [showLoginPwd, setShowLoginPwd] = useState(false);

    // Form states - Register
    const [regNombre, setRegNombre] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regRol, setRegRol] = useState("");
    const [regSemestre, setRegSemestre] = useState("");
    const [regLoading, setRegLoading] = useState(false);
    const [showRegPwd, setShowRegPwd] = useState(false);

    const baseLoginTheme = getCustomization("login");
    const loginTheme = useMemo(
        () => previewRequested && previewAllowed && previewTheme
            ? { ...baseLoginTheme, ...previewTheme }
            : baseLoginTheme,
        [baseLoginTheme, previewAllowed, previewRequested, previewTheme],
    );
    const isCustomPreview = previewRequested && previewAllowed && Boolean(previewTheme);
    const signupHeroImage = isCustomPreview ? loginTheme.heroImageUrl : "/imgs/banner_mobile_new.jpg";
    const loginHeroImage = isCustomPreview ? loginTheme.heroImageUrl : "/imgs/mkc.jpg";

    // Auto-redirect si ya hay sesión
    useEffect(() => {
        if (previewRequested) {
            const token = localStorage.getItem("access_token");
            if (!token) return undefined;
            let active = true;
            checkSessionToken(token)
                .then(async (response) => {
                    if (!response.ok) return;
                    const user = await response.json();
                    if (!active) return;
                    if (user?.rol === "admin") setPreviewAllowed(true);
                    else navigate("/principal", { replace: true });
                })
                .catch(() => {});
            return () => { active = false; };
        }
        if (localStorage.getItem("just_registered")) {
            localStorage.removeItem("just_registered");
            return;
        }
        const token = localStorage.getItem("access_token");
        if (token) {
            const userRaw = localStorage.getItem("user");
            if (userRaw) {
                try {
                    const user = JSON.parse(userRaw);
                    if (user?.id) {
                        const prefs =
                            JSON.parse(
                                localStorage.getItem(`prefs_${user.id}`),
                            ) || {};
                        if (prefs.manualLogin) return;
                    }
                } catch {
                    /* ignore */
                }
            }
            checkSessionToken(token)
                .then((res) => {
                    if (res.ok) navigate("/principal");
                    else {
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("user");
                    }
                })
                .catch(() => {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user");
                });
        }
        checkBackendHealth()
            .then(
                (r) =>
                    r.ok && r.json().then((d) => console.log("✅ Backend:", d)),
            )
            .catch(() => {});

    }, [navigate, previewRequested]);

    // La pestaña de login de prueba recibe el borrador del administrador por
    // BroadcastChannel; nada se escribe en localStorage ni en el servidor.
    useEffect(() => {
        if (!previewRequested || !previewId || typeof BroadcastChannel === "undefined") return undefined;
        const channel = new BroadcastChannel("cbtis-login-preview");
        channel.onmessage = (event) => {
            if (event.data?.type === "LOGIN_PREVIEW_THEME" && event.data.previewId === previewId && event.data.theme) {
                setPreviewTheme(event.data.theme);
            }
        };
        channel.postMessage({ type: "LOGIN_PREVIEW_REQUEST", previewId });
        const closePreview = () => channel.postMessage({ type: "LOGIN_PREVIEW_CLOSED", previewId });
        window.addEventListener("beforeunload", closePreview);
        return () => {
            window.removeEventListener("beforeunload", closePreview);
            closePreview();
            channel.close();
        };
    }, [previewId, previewRequested]);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--color-primary", loginTheme.primaryColor || "#f20d0d");
        root.style.setProperty("--color-primary-dark", loginTheme.secondaryColor || "#6e0404");
        root.style.setProperty("--color-primary-darker", loginTheme.secondaryColor || "#6e0404");
        root.style.setProperty("--color-primary-gradient", loginTheme.primaryColor || "#f20d0d");
    }, [loginTheme]);

    // Fix PC bug (useEffect separado para que SIEMPRE se registre):
    // Si Google abre pestaña nueva en vez de popup, escucha cuando el token
    // se guarde desde esa otra pestaña y redirige la pestaña original aquí.
    useEffect(() => {
        const handleCrossTabAuth = (e) => {
            if (e.key === "access_token" && e.newValue) {
                navigate("/principal");
            }
        };
        window.addEventListener("storage", handleCrossTabAuth);
        return () => window.removeEventListener("storage", handleCrossTabAuth);
    }, [navigate]);

    // Validación visual de inputs
    const getInputStyle = (type, value) => {
        if (!value) return {};
        if (type === "email") {
            const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            return {
                borderColor: valid ? "#22c55e" : "#ef4444",
                boxShadow: valid
                    ? "0 0 0 3px rgba(34,197,94,0.15)"
                    : "0 0 0 3px rgba(239,68,68,0.15)",
            };
        }
        if (type === "password") {
            const valid = value.length >= 6;
            return {
                borderColor: valid ? "#22c55e" : "#ef4444",
                boxShadow: valid
                    ? "0 0 0 3px rgba(34,197,94,0.15)"
                    : "0 0 0 3px rgba(239,68,68,0.15)",
            };
        }
        return {};
    };

    // ── Google Identity Services (GIS) ──
    const loginGoogleRef = useRef(null);
    const signupGoogleRef = useRef(null);
    const gsiReady = useRef(false);

    const sendGoogleToken = useCallback(
        async (id_token) => {
            try {
                const res = await loginWithGoogleToken(id_token);
                const data = await res.json();
                if (res.ok) {
                    login(data.user, data.access_token);
                    showToast(`¡Bienvenido ${data.user.nombre}! 🎉`, "success");
                    setTimeout(() => {
                        // Si esta pestaña fue abierta por el popup de Google (PC),
                        // intentar cerrarla — la pestaña original ya redirigió via storage event
                        if (window.opener || window.history.length <= 1) {
                            try { window.close(); } catch { /* El navegador puede bloquear el cierre de la pestaña. */ }
                        }
                        navigate("/principal");
                    }, 300);
                } else {
                    showToast(
                        "Error con Google: " +
                            (data.detail || "Intenta de nuevo"),
                        "error",
                    );
                }
            } catch {
                showToast("Error de conexión con el servidor", "error");
            }
        },
        [login, navigate],
    );

    // Render GIS buttons into the two ref containers
    const renderGSIButtons = useCallback(() => {
        if (!window.google?.accounts?.id) return;
        [loginGoogleRef, signupGoogleRef].forEach((ref) => {
            if (!ref.current) return;
            ref.current.innerHTML = "";
            window.google.accounts.id.renderButton(ref.current, {
                type: "standard",
                theme: "outline",
                size: "large",
                text: "continue_with",
                width: Math.max(ref.current.offsetWidth || 340, 200),
            });
        });
    }, []);

    // Load GIS script once and initialise
    useEffect(() => {
        const init = () => {
            if (gsiReady.current) return;
            gsiReady.current = true;
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: ({ credential }) => sendGoogleToken(credential),
                ux_mode: "popup",
                cancel_on_tap_outside: true,
            });
            renderGSIButtons();
        };

        if (window.google) {
            init();
            return;
        }

        const script = document.createElement("script");
        script.id = "gsi-client-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = init;
        if (!document.getElementById("gsi-client-script")) {
            document.head.appendChild(script);
        }
    }, [sendGoogleToken, renderGSIButtons]);

    // Re-render buttons when login/signup panel switches
    useEffect(() => {
        const timer = setTimeout(renderGSIButtons, 80);
        return () => clearTimeout(timer);
    }, [isActive, renderGSIButtons]);

    // Login submit
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) {
            showToast("Por favor llena todos los campos", "warning");
            return;
        }
        setLoginLoading(true);
        try {
            const response = await loginUser(loginEmail, loginPassword);
            const data = await response.json();
            if (response.ok) {
                login(data.user, data.access_token);
                if (data.user.id) {
                    const prev = localStorage.getItem(`perfil_${data.user.id}`);
                    if (!prev)
                        localStorage.setItem(
                            `perfil_${data.user.id}`,
                            JSON.stringify(data.user),
                        );
                }
                showToast(`¡Bienvenid@ ${data.user.nombre}! 🎉`, "success");
                setLoginLoading(false);
                navigate("/principal?splash=1", { replace: true });
            } else {
                showToast(
                    data.detail || "Email o contraseña incorrectos",
                    "error",
                );
                setLoginLoading(false);
            }
        } catch {
            showToast("Error de conexión con el servidor", "error");
            setLoginLoading(false);
        }
    };

    // Register submit
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!regNombre || !regEmail || !regPassword || !regRol) {
            showToast(
                "Por favor llena todos los campos, incluyendo tu rol",
                "warning",
            );
            return;
        }
        if (regRol === "estudiante" && !regSemestre) {
            showToast("Por favor selecciona tu semestre", "warning");
            return;
        }
        if (regPassword.length < 6) {
            showToast(
                "La contraseña debe tener al menos 6 caracteres",
                "warning",
            );
            return;
        }
        setRegLoading(true);
        try {
            const userData = {
                nombre: regNombre,
                email: regEmail,
                password: regPassword,
                rol: regRol,
                semestre: regSemestre ? parseInt(regSemestre) : null,
            };
            const response = await registerSendOTP(userData);
            const data = await response.json();
            if (response.ok) {
                showToast("Código enviado a tu correo", "success");
                setOtpEmail(regEmail);
                setOtpUserParams({
                    nombre: regNombre,
                    rol: regRol,
                    semestre: regRol === "estudiante" ? regSemestre : null,
                });
                setShowOtp(true);
            } else {
                showToast(data.detail || "Error al iniciar registro", "error");
            }
        } catch {
            showToast(
                "Error de conexión. Verifica que el backend esté corriendo",
                "error",
            );
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <div className="login-page bg-background-light dark:bg-background-dark min-h-screen md:flex md:items-center md:justify-center p-0 md:p-4">
            {previewRequested && previewAllowed && <div className="fixed left-1/2 top-3 z-[10000] flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xl"><span>Vista previa de login — sesión admin conservada</span><button type="button" onClick={() => navigate('/admin?tab=personalizacion')} className="rounded-full bg-white/15 px-3 py-1 hover:bg-white/25">Volver al editor</button></div>}
            <div
                className={`container-box w-full md:max-w-[1200px] md:min-h-[700px] bg-background-light dark:bg-background-dark md:bg-white md:dark:bg-slate-900 md:shadow-2xl mx-auto rounded-none md:rounded-xl ${isActive ? "active" : ""}`}
            >
                {/* ── SIGN UP ── */}
                <div className="form-container sign-up sign-up-container bg-background-light dark:bg-background-dark md:bg-white md:dark:bg-slate-900 px-0 py-0 md:px-16 md:py-8 flex flex-col justify-start md:justify-center">
                    {/* Mobile header */}
                    <header className="md:hidden flex items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark sticky top-0 z-50">
                        <button
                            aria-label="Volver"
                            onClick={() => setIsActive(false)}
                            className="text-primary cursor-pointer"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                        <h1 className="text-xl font-extrabold tracking-tight text-[#0f172a] dark:text-white">Crear cuenta</h1>
                        <div className="w-6"></div>
                    </header>
                    {/* Mobile hero */}
                    <section className="md:hidden relative w-full h-64 overflow-hidden mb-8" style={isCustomPreview ? createBrandBackground(loginTheme) : undefined}>
                        {signupHeroImage && <img alt={isCustomPreview ? `Imagen de ${loginTheme.title}` : "Edificio CBTis 258"} className="h-full w-full object-cover brightness-75" src={signupHeroImage} />}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
                        <div className="absolute bottom-6 left-0 right-0 px-6">
                            <h2 className="text-white text-3xl font-black uppercase tracking-wide leading-tight">
                                {loginTheme.tagline || "UN MOTIVO DE ORGULLO"}
                            </h2>
                        </div>
                    </section>

                    <div className="px-6 md:px-0 pb-10 md:pb-0">
                        <div className="max-w-md mx-auto w-full">
                            <div className="mb-4 text-center md:text-left">
                                <h2 className="text-slate-900 dark:text-slate-100 text-3xl font-bold mb-2">
                                    Registro
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Únete a nuestra comunidad educativa.
                                </p>
                            </div>
                            <div
                                ref={signupGoogleRef}
                                className="w-full mt-4 flex justify-center"
                                style={{ minHeight: 44, colorScheme: "light" }}
                            />
                            <div className="relative flex py-4 items-center">
                                <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                                <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">
                                    O usa tu email
                                </span>
                                <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                            </div>
                            <form
                                className="space-y-4"
                                onSubmit={handleRegister}
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Nombre
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-xl">
                                                person
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={regNombre}
                                            onChange={(e) =>
                                                setRegNombre(e.target.value)
                                            }
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="Nombre completo"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-xl">
                                                mail
                                            </span>
                                        </div>
                                        <input
                                            type="email"
                                            autoComplete="email"
                                            value={regEmail}
                                            onChange={(e) =>
                                                setRegEmail(e.target.value)
                                            }
                                            style={getInputStyle(
                                                "email",
                                                regEmail,
                                            )}
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="example@cbtis258.edu.mx"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-xl">
                                                lock
                                            </span>
                                        </div>
                                        <input
                                            type={
                                                showRegPwd ? "text" : "password"
                                            }
                                            autoComplete="new-password"
                                            value={regPassword}
                                            onChange={(e) =>
                                                setRegPassword(e.target.value)
                                            }
                                            style={getInputStyle(
                                                "password",
                                                regPassword,
                                            )}
                                            className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            aria-label={showRegPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                                            onClick={() => setShowRegPwd((visible) => !visible)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-1 text-slate-400 hover:text-primary cursor-pointer"
                                        >
                                            <i aria-hidden="true" className={`fa-solid ${showRegPwd ? "fa-eye-slash" : "fa-eye"}`} />
                                        </button>
                                    </div>
                                </div>
                                {/* Rol */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Rol
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-xl">
                                                badge
                                            </span>
                                        </div>
                                        <select
                                            value={regRol}
                                            onChange={(e) => {
                                                setRegRol(e.target.value);
                                                if (
                                                    e.target.value !==
                                                    "estudiante"
                                                )
                                                    setRegSemestre("");
                                            }}
                                            className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                                        >
                                            <option disabled value="">
                                                Selecciona tu rol
                                            </option>
                                            <option value="estudiante">
                                                Estudiante
                                            </option>
                                            <option value="padre">
                                                Padre de familia
                                            </option>
                                            <option value="profesor">
                                                Profesor
                                            </option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400">
                                                expand_more
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Semestre */}
                                {regRol === "estudiante" && (
                                    <div className="transition-all duration-300">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Semestre
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-slate-400 text-xl">
                                                    school
                                                </span>
                                            </div>
                                            <select
                                                value={regSemestre}
                                                onChange={(e) =>
                                                    setRegSemestre(
                                                        e.target.value,
                                                    )
                                                }
                                                className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                                            >
                                                <option disabled value="">
                                                    Selecciona tu semestre
                                                </option>
                                                {[1, 2, 3, 4, 5, 6].map((s) => (
                                                    <option key={s} value={s}>
                                                        {
                                                            [
                                                                "1er",
                                                                "2do",
                                                                "3er",
                                                                "4to",
                                                                "5to",
                                                                "6to",
                                                            ][s - 1]
                                                        }{" "}
                                                        Semestre
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <span className="material-symbols-outlined text-slate-400">
                                                    expand_more
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={regLoading}
                                    className="w-full bg-primary text-white py-4 px-4 rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-primary/20 transition-all mt-2 cursor-pointer disabled:opacity-50"
                                >
                                    {regLoading
                                        ? "Registrando..."
                                        : "Crear cuenta"}
                                </button>
                            </form>
                            <div className="md:hidden flex justify-center mt-6 w-full">
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    ¿Ya tienes una cuenta?{" "}
                                    <button
                                        type="button"
                                        className="border-0 bg-transparent text-primary font-bold hover:underline ml-1 cursor-pointer"
                                        onClick={() => setIsActive(false)}
                                    >
                                        Inicia sesión
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── SIGN IN ── */}
                <div className="form-container sign-in sign-in-container bg-background-light dark:bg-background-dark md:bg-white md:dark:bg-slate-900 px-0 py-0 md:px-16 md:py-8 flex flex-col justify-start md:justify-center">
                    <header className="md:hidden flex items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark sticky top-0 z-50">
                        <div className="w-6"></div>
                        <h1 className="text-xl font-extrabold tracking-tight text-[#0f172a] dark:text-white uppercase">
                            {loginTheme.title}
                        </h1>
                        <div className="w-6"></div>
                    </header>
                    <section className="md:hidden relative w-full h-64 overflow-hidden mb-8" style={isCustomPreview ? createBrandBackground(loginTheme) : undefined}>
                        {loginHeroImage && <img alt={isCustomPreview ? `Imagen de ${loginTheme.title}` : "Edificio CBTis 258"} className="h-full w-full object-cover brightness-75" src={loginHeroImage} />}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
                        <div className="absolute bottom-6 left-0 right-0 px-6">
                            <h2 className="text-white text-3xl font-black uppercase tracking-wide leading-tight">
                                {loginTheme.tagline || "UN MOTIVO DE ORGULLO"}
                            </h2>
                        </div>
                    </section>

                    <div className="px-6 md:px-0 pb-10 md:pb-0">
                        <div className="mb-8 hidden md:flex items-center gap-2">
                            <img
                                src={loginTheme.logoUrl || "/imgs/yameharte.png"}
                                alt={`Logo ${loginTheme.title}`}
                                className="w-10 h-10 object-contain"
                            />
                        </div>
                        <div className="max-w-md w-full mx-auto">
                            <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-bold mb-2 text-center md:text-left">
                                Iniciar sesión
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 text-center md:text-left">
                                {loginTheme.description || "Accede a tu cuenta institucional"}
                            </p>
                            <div
                                ref={loginGoogleRef}
                                className="w-full mb-6 flex justify-center"
                                style={{ minHeight: 44, colorScheme: "light" }}
                            />
                            <div className="relative flex py-4 items-center mb-6">
                                <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                                <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">
                                    O usa tu contraseña de Email
                                </span>
                                <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                            </div>
                            <form className="space-y-6" onSubmit={handleLogin}>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                                        Email
                                    </label>
                                    <div className="relative flex items-center">
                                        <span className="material-symbols-outlined absolute left-4 text-slate-400">
                                            mail
                                        </span>
                                        <input
                                            type="email"
                                            autoComplete="email"
                                            value={loginEmail}
                                            onChange={(e) =>
                                                setLoginEmail(e.target.value)
                                            }
                                            style={getInputStyle(
                                                "email",
                                                loginEmail,
                                            )}
                                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="Email"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                                        Contraseña
                                    </label>
                                    <div className="relative flex items-center">
                                        <span className="material-symbols-outlined absolute left-4 text-slate-400">
                                            lock
                                        </span>
                                        <input
                                            type={
                                                showLoginPwd
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="current-password"
                                            value={loginPassword}
                                            onChange={(e) =>
                                                setLoginPassword(e.target.value)
                                            }
                                            style={getInputStyle(
                                                "password",
                                                loginPassword,
                                            )}
                                            className="w-full pl-12 pr-12 py-3 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="Contraseña"
                                            required
                                        />
                                        <button
                                            type="button"
                                            aria-label={showLoginPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                                            onClick={() => setShowLoginPwd((visible) => !visible)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-1 text-slate-400 hover:text-primary cursor-pointer"
                                        >
                                            <i aria-hidden="true" className={`fa-solid ${showLoginPwd ? "fa-eye-slash" : "fa-eye"}`} />
                                        </button>
                                    </div>
                                    <div className="text-right mt-1">
                                        <button
                                            type="button"
                                            className="border-0 bg-transparent p-0 text-primary text-sm font-medium hover:underline cursor-pointer"
                                            onClick={() => setShowForgot(true)}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loginLoading}
                                    className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 pt-4 pb-4 rounded-lg transition-colors shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
                                >
                                    {loginLoading
                                        ? "Iniciando..."
                                        : "Iniciar sesión"}
                                </button>
                            </form>
                            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-center dark:border-slate-700 dark:bg-slate-800/60">
                                <p className="m-0 text-xs text-slate-500 dark:text-slate-400">¿Eres docente de otro plantel?</p>
                                <Link to="/acceso-escuela" className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-primary no-underline hover:underline">
                                    Explora el acceso para instituciones <span className="material-symbols-outlined text-base">arrow_forward</span>
                                </Link>
                            </div>
                            <div className="md:hidden flex justify-center mt-6 w-full">
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    ¿No tienes una cuenta?{" "}
                                    <button
                                        type="button"
                                        className="border-0 bg-transparent text-primary font-bold hover:underline ml-1 cursor-pointer"
                                        onClick={() => setIsActive(true)}
                                    >
                                        Regístrate
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── DESKTOP OVERLAY SLIDER ── */}
                <div className="overlay-container hidden md:block pointer-events-none">
                    <div className="overlay bg-primary" style={isCustomPreview ? createBrandBackground(loginTheme) : undefined}>
                        <div className="absolute inset-0 opacity-10">
                            <svg
                                height="100%"
                                width="100%"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <pattern
                                        height="40"
                                        id="grid1"
                                        patternUnits="userSpaceOnUse"
                                        width="40"
                                    >
                                        <path
                                            d="M 40 0 L 0 0 0 40"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="1"
                                        />
                                    </pattern>
                                </defs>
                                <rect
                                    fill="url(#grid1)"
                                    height="100%"
                                    width="100%"
                                />
                            </svg>
                        </div>
                        <div className="overlay-panel overlay-left pointer-events-auto">
                            <img
                                src={loginTheme.logoUrl || "/imgs/yameharte.png"}
                                alt={`Logo ${loginTheme.title}`}
                                className="w-32 h-32 object-contain mb-8 z-10"
                            />
                            <h2 className="text-white text-5xl font-extrabold mb-4 tracking-tight">
                                {loginTheme.title}
                            </h2>
                            <p className="text-white/90 text-xl font-medium mb-12 tracking-widest uppercase">
                                {loginTheme.tagline}
                            </p>
                            <div className="w-full max-w-xs space-y-4">
                                <p className="text-white/80 text-sm">
                                    ¿Ya tienes una cuenta?
                                </p>
                                <button
                                    onClick={() => setIsActive(false)}
                                    className="w-full border-2 border-white text-white font-bold py-4 rounded-lg hover:bg-white hover:text-primary transition-all duration-300 cursor-pointer"
                                >
                                    Iniciar sesión
                                </button>
                            </div>
                        </div>
                        <div className="overlay-panel overlay-right pointer-events-auto">
                            <img
                                src={loginTheme.logoUrl || "/imgs/yameharte.png"}
                                alt={`Logo ${loginTheme.title}`}
                                className="w-32 h-32 object-contain mb-8 z-10"
                            />
                            <h2 className="text-white text-5xl font-extrabold mb-4 tracking-tight">
                                {loginTheme.title}
                            </h2>
                            <p className="text-white/90 text-xl font-medium mb-12 tracking-widest uppercase">
                                {loginTheme.tagline}
                            </p>
                            <div className="w-full max-w-xs space-y-4">
                                <p className="text-white/80 text-sm">
                                    ¿No tienes una cuenta?
                                </p>
                                <button
                                    onClick={() => setIsActive(true)}
                                    className="w-full border-2 border-white text-white font-bold py-4 rounded-lg hover:bg-white hover:text-primary transition-all duration-300 cursor-pointer"
                                >
                                    Crear cuenta
                                </button>
                            </div>
                        </div>
                        <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ForgotModal
                isOpen={showForgot}
                onClose={() => setShowForgot(false)}
                onGoToSignup={() => setIsActive(true)}
            />
            <OtpModal
                isOpen={showOtp}
                onClose={() => setShowOtp(false)}
                email={otpEmail}
                userParams={otpUserParams}
                navigate={navigate}
                onAuthenticated={login}
            />
        </div>
    );
}
