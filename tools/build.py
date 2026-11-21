"""Builds the English and Spanish pages from one template: python tools/build.py"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EMAIL = "danapps.dev@gmail.com"
UPDATED = {"en": "21 November 2026", "es": "21 de noviembre de 2026"}

T = {
 "en": dict(
  title="SuperHSK – Learn Chinese from zero to HSK 3",
  desc="A real Chinese course in your pocket: step-by-step lessons, tone trainer, stroke-by-stroke writing, graded reading and speaking. Free, no account, no ads.",
  nav=["Features", "Levels", "Privacy"], other="Español",
  badge_new="New", badge="Coming soon to Google Play",
  h1a="Learn Chinese.", h1b="For real.",
  lead="From your first 你好 to talking about your life. Short lessons that build on each other, tones you can finally hear, characters you write stroke by stroke.",
  play_small="Coming soon on", play="Google Play", see="See what's inside",
  trust=["Free", "No account", "No ads"],
  chip1="Tone 3 · nǐ", chip2="Streak: 12 days", chip3="Correct!",
  q_tag="Choose the meaning", opts=["thank you", "hello", "goodbye", "sorry"],
  next="Continue", unit="Unit 1",
  k1="Features", h2a="Everything you need.<br>Nothing you don't.",
  sub1="Each unit mixes new words, grammar, listening, reading, writing and speaking, and ends with a short exam.",
  course_h="A course, not a word list", course_p="Units in order, from greetings to real conversations. Each lesson unlocks the next, and reviews come back right when you're about to forget.",
  tones_h="Tone trainer", tones_p="Hear the four tones at your speed until they sound different.",
  write_h="Write every character", write_p="Stroke by stroke. Follow the path and watch them turn green.",
  read_h="Graded reading", read_p="Stories with only the words you know. Tap any word.",
  read_hl="Tap a word to see its meaning",
  speak_h="Speak from day one", speak_p="Repeat after native audio and play role-plays with an AI partner.",
  speak_b="我想要一杯咖啡。 ✓",
  gram_h="Grammar that makes sense", gram_p="Short points with patterns and examples, in plain English.",
  gram_f=["Subject", "很", "Adjective"], gram_ex="我很好。", gram_tr="I'm (very) good.",
  rev_h="Smart reviews", rev_p="Spaced repetition decides what to review today, so you remember for good.",
  rev_tag="due today",
  k2="Levels", h2b="Built around HSK.", sub2="The official Chinese proficiency levels. HSK 1–3 are ready, HSK 4 arrives in updates.",
  levels=[("Level 1", "HSK 1", "Your first words: greetings, numbers, family.", "Ready"),
          ("Level 2", "HSK 2", "Everyday life: shopping, food, getting around.", "Ready"),
          ("Level 3", "HSK 3", "Talk about your life, plans and feelings.", "Ready"),
          ("Level 4", "HSK 4", "Longer texts and nuance, unit by unit.", "Coming soon")],
  stats=[("38", "units"), ("3", "HSK levels"), ("2", "languages"), ("0", "ads")],
  k3="Privacy", h2c="Your progress is yours.", sub3="No account, no tracking. Everything you learn stays on your phone.",
  pr=[("📱", "Stays on your phone", "Your progress never leaves your device. Export a backup whenever you want."),
      ("🚫", "No ads, no analytics", "No advertising and no tracking SDKs. Ever."),
      ("🔒", "Only what's needed", "AI and speech features send only the text or audio they need to work.")],
  more="Read the privacy policy →",
  fh="Start with 你好 today.", fp="SuperHSK is coming soon to Google Play, free.",
  foot_priv="Privacy policy", home="Home",
 ),
 "es": dict(
  title="SuperHSK – Aprende chino desde cero hasta el HSK 3",
  desc="Un curso de chino de verdad en el bolsillo: lecciones paso a paso, entrenador de tonos, escritura trazo a trazo, lecturas y conversación. Gratis, sin cuenta y sin anuncios.",
  nav=["Funciones", "Niveles", "Privacidad"], other="English",
  badge_new="Nuevo", badge="Muy pronto en Google Play",
  h1a="Aprende chino.", h1b="De verdad.",
  lead="Desde tu primer 你好 hasta hablar de tu vida. Lecciones cortas que se apoyan unas en otras, tonos que por fin oyes y caracteres que escribes trazo a trazo.",
  play_small="Muy pronto en", play="Google Play", see="Ver qué trae",
  trust=["Gratis", "Sin cuenta", "Sin anuncios"],
  chip1="Tono 3 · nǐ", chip2="Racha: 12 días", chip3="¡Correcto!",
  q_tag="Elige el significado", opts=["gracias", "hola", "adiós", "perdón"],
  next="Continuar", unit="Unidad 1",
  k1="Funciones", h2a="Todo lo que necesitas.<br>Nada que sobre.",
  sub1="Cada unidad mezcla palabras nuevas, gramática, escucha, lectura, escritura y conversación, y acaba con un examen corto.",
  course_h="Un curso, no una lista de palabras", course_p="Unidades en orden, desde los saludos hasta conversaciones reales. Cada lección abre la siguiente, y los repasos vuelven justo cuando ibas a olvidar.",
  tones_h="Entrenador de tonos", tones_p="Oye los cuatro tonos a tu velocidad hasta distinguirlos.",
  write_h="Escribe cada carácter", write_p="Trazo a trazo. Sigue el recorrido y míralos ponerse en verde.",
  read_h="Lecturas por nivel", read_p="Historias solo con palabras que conoces. Toca cualquiera.",
  read_hl="Toca una palabra para ver qué significa",
  speak_h="Habla desde el primer día", speak_p="Repite tras audios nativos y practica situaciones con un compañero de IA.",
  speak_b="我想要一杯咖啡。 ✓",
  gram_h="Gramática que se entiende", gram_p="Puntos cortos con su estructura y ejemplos, explicados en claro.",
  gram_f=["Sujeto", "很", "Adjetivo"], gram_ex="我很好。", gram_tr="Estoy (muy) bien.",
  rev_h="Repasos inteligentes", rev_p="La repetición espaciada decide qué repasar hoy, para que lo recuerdes de verdad.",
  rev_tag="para hoy",
  k2="Niveles", h2b="Pensada para el HSK.", sub2="Los niveles oficiales de chino. HSK 1–3 ya están; el HSK 4 llega en actualizaciones.",
  levels=[("Nivel 1", "HSK 1", "Tus primeras palabras: saludos, números, familia.", "Disponible"),
          ("Nivel 2", "HSK 2", "El día a día: compras, comida, moverte.", "Disponible"),
          ("Nivel 3", "HSK 3", "Habla de tu vida, tus planes y lo que sientes.", "Disponible"),
          ("Nivel 4", "HSK 4", "Textos más largos y matices, unidad a unidad.", "Muy pronto")],
  stats=[("38", "unidades"), ("3", "niveles HSK"), ("2", "idiomas"), ("0", "anuncios")],
  k3="Privacidad", h2c="Tu progreso es tuyo.", sub3="Sin cuenta y sin rastreo. Todo lo que aprendes se queda en tu móvil.",
  pr=[("📱", "Se queda en tu móvil", "Tu progreso nunca sale del dispositivo. Exporta una copia cuando quieras."),
      ("🚫", "Sin anuncios ni analítica", "Sin publicidad y sin herramientas de rastreo. Nunca."),
      ("🔒", "Solo lo necesario", "La IA y la voz envían solo el texto o el audio que necesitan para funcionar.")],
  more="Leer la política de privacidad →",
  fh="Empieza hoy con 你好.", fp="SuperHSK llega muy pronto a Google Play, gratis.",
  foot_priv="Política de privacidad", home="Inicio",
 ),
}

PLAY_SVG = '<svg viewBox="0 0 24 24"><path fill="#34A853" d="M3.6 2.2 13.7 12 3.6 21.8c-.4-.2-.6-.6-.6-1.1V3.3c0-.5.2-.9.6-1.1z"/><path fill="#FBBC04" d="m17 15.3-3.3-3.3L17 8.7l3.8 2.2c.9.5.9 1.7 0 2.2z"/><path fill="#EA4335" d="M13.7 12 3.6 21.8c.3.2.8.2 1.2 0L17 15.3z"/><path fill="#4285F4" d="M3.6 2.2c.4-.2.9-.2 1.2 0L17 8.7 13.7 12z"/></svg>'

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Serif+SC:wght@700;900&display=swap" rel="stylesheet">')


def head(lang, title, desc, pre, canonical):
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0e0b0a">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<meta property="og:type" content="website"><meta property="og:url" content="https://dan12590.github.io/superhsk/{canonical}">
<link rel="icon" href="{pre}assets/icon.svg" type="image/svg+xml">
{FONTS}
<link rel="stylesheet" href="{pre}assets/style.css">
</head>
<body>
"""


def nav(t, pre, home, priv, other_href, anchors=True):
    a = t["nav"]
    links = (f'<a href="{home}#features">{a[0]}</a><a href="{home}#levels">{a[1]}</a>' if anchors else "")
    return (f'<header class="nav"><a class="brand" href="{home}"><span class="logo">汉</span>SuperHSK</a>'
            f'<nav class="links">{links}<a href="{priv}">{a[2]}</a><a class="pill" href="{other_href}">{t["other"]}</a></nav></header>\n')


def footer(t, home, priv, other_href):
    return (f'<footer><div class="wrap"><span>© 2026 SuperHSK · <a href="mailto:{EMAIL}">{EMAIL}</a></span>'
            f'<span><a href="{home}">{t["home"]}</a> · <a href="{priv}">{t["foot_priv"]}</a> · <a href="{other_href}">{t["other"]}</a></span></div></footer>\n')


def landing(lang):
    t = T[lang]
    pre = "" if lang == "en" else "../"
    priv = "privacy.html" if lang == "en" else "privacidad.html"
    other = "es/" if lang == "en" else "../"
    words = [("你好", "nǐ hǎo"), ("谢谢", "xièxie"), ("学习", "xuéxí"), ("中国", "Zhōngguó"), ("朋友", "péngyou"),
             ("喜欢", "xǐhuan"), ("咖啡", "kāfēi"), ("今天", "jīntiān"), ("汉字", "hànzì"), ("加油", "jiāyóu")]
    marquee = "".join(f"<span><b>{h}</b><em>{p}</em></span>" for h, p in words) * 2
    o = t["opts"]
    lv = "".join(
        f'<div class="lv lv{i+1} rv"><span class="n">{n}</span><b>{b}</b><p>{p}</p><span class="st">{s}</span><span class="ch">{c}</span></div>'
        for i, ((n, b, p, s), c) in enumerate(zip(t["levels"], "一二三四")))
    stats = "".join(f'<div class="stat rv"><b>{n}</b><span>{l}</span></div>' for n, l in t["stats"])
    prs = "".join(f'<div class="pr rv"><div class="e">{e}</div><h3>{h}</h3><p>{p}</p></div>' for e, h, p in t["pr"])
    wchars = "你好我是学生中国人喜欢喝茶"
    wg = "".join(f'<span class="{"g" if i < 8 else ""}">{c}</span>' for i, c in enumerate(wchars[:10]))
    bars = "<i></i>" * 22
    nodes = ('<div class="node done">你</div><div class="link done"></div><div class="node done">好</div><div class="link done"></div>'
             '<div class="node done">我</div><div class="link done"></div><div class="node now">是</div><div class="link"></div>'
             '<div class="node">学</div><div class="link"></div><div class="node">生</div>')
    trust = "".join(f"<span>{x}</span>" for x in t["trust"])
    return head(lang, t["title"], t["desc"], pre, "" if lang == "en" else "es/") + nav(t, pre, "./", priv, other) + f"""
<main>
<section class="hero">
<svg class="ghostchar" viewBox="0 0 1000 1000" aria-hidden="true"><text x="50" y="860">学</text></svg>
<div class="wrap">
 <div>
  <span class="badge"><i>{t["badge_new"]}</i>{t["badge"]}</span>
  <h1>{t["h1a"]}<br><span class="grad">{t["h1b"]}</span></h1>
  <p class="lead">{t["lead"]}</p>
  <div class="cta">
   <a class="play" href="#levels">{PLAY_SVG}<span><small>{t["play_small"]}</small>{t["play"]}</span></a>
   <a class="ghost" href="#features">{t["see"]}</a>
  </div>
  <div class="trust">{trust}</div>
 </div>
 <div class="stage" aria-hidden="true">
  <div class="chip c1"><b>你</b>{t["chip1"]}</div>
  <div class="chip c2">🔥 {t["chip2"]}</div>
  <div class="chip c3"><span class="dot"></span>{t["chip3"]}</div>
  <div class="phone"><div class="screen">
   <div class="sbar">{t["unit"]}<div class="prog"><b></b></div>62%</div>
   <div class="qcard"><div class="tag">{t["q_tag"]}</div><div class="hz">你好</div><div class="py">nǐ hǎo</div></div>
   <div class="opts"><div class="opt">{o[0]}</div><div class="opt ok">{o[1]}</div><div class="opt">{o[2]}</div><div class="opt">{o[3]}</div></div>
   <div class="btnapp">{t["next"]}</div>
  </div></div>
 </div>
</div>
</section>
<div class="marquee" aria-hidden="true"><div class="track">{marquee}</div></div>

<section id="features"><div class="wrap">
 <div class="rv"><span class="kicker">{t["k1"]}</span><h2>{t["h2a"]}</h2><p class="sub">{t["sub1"]}</p></div>
 <div class="bento">
  <div class="tile t-course rv"><div class="icon i-red">课</div><h3>{t["course_h"]}</h3><p>{t["course_p"]}</p><div class="path">{nodes}</div></div>
  <div class="tile t-tones rv"><div class="icon i-gold">音</div><h3>{t["tones_h"]}</h3><p>{t["tones_p"]}</p>
   <div class="vis tones"><svg viewBox="0 0 400 120" preserveAspectRatio="none">
    <path d="M10 25 H90" stroke="#e0243b"/><path d="M110 95 L190 20" stroke="#f2b544"/>
    <path d="M210 55 Q240 115 290 30" stroke="#1fa971"/><path d="M310 20 L390 100" stroke="#4c8dff"/></svg>
    <div class="tlabels"><span style="color:#e0243b">mā</span><span style="color:#e59b1c">má</span><span style="color:#1fa971">mǎ</span><span style="color:#4c8dff">mà</span></div></div></div>
  <div class="tile t-write rv"><div class="icon i-jade">写</div><h3>{t["write_h"]}</h3><p>{t["write_p"]}</p><div class="vis wgrid">{wg}</div></div>
  <div class="tile t-read rv"><div class="icon i-sky">读</div><h3>{t["read_h"]}</h3><p>{t["read_p"]}</p>
   <div class="vis ruby"><ruby>我<rt>wǒ</rt></ruby><ruby>喜<rt>xǐ</rt></ruby><ruby>欢<rt>huan</rt></ruby><mark><ruby>喝<rt>hē</rt></ruby><ruby>茶<rt>chá</rt></ruby></mark>。</div></div>
  <div class="tile t-speak rv"><div class="icon i-sky">说</div><h3>{t["speak_h"]}</h3><p>{t["speak_p"]}</p><div class="vis"><div class="wave">{bars}</div><span class="bubble han">{t["speak_b"]}</span></div></div>
  <div class="tile t-gram rv"><div class="icon i-ink">文</div><h3>{t["gram_h"]}</h3><p>{t["gram_p"]}</p>
   <div class="vis"><div class="formula"><span>{t["gram_f"][0]}</span>+<span class="k">{t["gram_f"][1]}</span>+<span>{t["gram_f"][2]}</span></div>
   <div class="example">{t["gram_ex"]}<small>{t["gram_tr"]}</small></div></div></div>
  <div class="tile t-review rv"><div class="icon i-gold">复</div><h3>{t["rev_h"]}</h3><p>{t["rev_p"]}</p>
   <div class="vis stack"><div><b>朋友</b><em>{t["rev_tag"]}</em></div><div><b>喜欢</b><em>{t["rev_tag"]}</em></div><div><b>学习</b><em>{t["rev_tag"]}</em></div></div></div>
 </div>
</div></section>

<section id="levels" style="padding-top:20px"><div class="wrap">
 <div class="rv"><span class="kicker">{t["k2"]}</span><h2>{t["h2b"]}</h2><p class="sub">{t["sub2"]}</p></div>
 <div class="levels">{lv}</div>
 <div class="stats">{stats}</div>
</div></section>

<div class="dark"><div class="wrap">
 <div class="rv"><span class="kicker" style="color:var(--gold)">{t["k3"]}</span><h2>{t["h2c"]}</h2><p class="sub">{t["sub3"]}</p></div>
 <div class="promises">{prs}</div>
 <a class="more" href="{priv}">{t["more"]}</a>
</div></div>

<section class="final"><div class="wrap rv">
 <div class="seal">学</div>
 <h2>{t["fh"]}</h2><p class="sub" style="margin:0 auto 34px">{t["fp"]}</p>
 <div class="cta"><a class="play" href="#">{PLAY_SVG}<span><small>{t["play_small"]}</small>{t["play"]}</span></a></div>
</div></section>
</main>
""" + footer(t, "./", priv, other) + f'<script src="{pre}assets/site.js"></script>\n</body>\n</html>\n'


P = {
 "en": dict(
  title="Privacy policy – SuperHSK", kicker="Legal", h1="Privacy policy", upd="Last updated",
  summary="<b>In short:</b> SuperHSK has no accounts, no ads and no analytics. Your progress is stored only on your phone. Data leaves your phone only when you use a feature that needs it (AI exercises, speech recognition or sending feedback), and only what that feature needs.",
  who_h="Who we are", who=f'SuperHSK is an app for learning Chinese made by an independent developer. For any question about this policy, write to <a href="mailto:{EMAIL}">{EMAIL}</a>.',
  local_h="Data stored on your phone", local="Your course progress, reviews, settings and statistics are stored only on your device. We cannot see them. If you export a backup, the file is saved where you choose and is not sent to us. Uninstalling the app or clearing its data deletes all of it.",
  out_h="Data that leaves your phone", cols=["Feature", "What is sent", "To whom"],
  rows=[("AI exercises", "The text of the exercise and your answer. No name, no account, no contacts.", "The AI service that answers (Groq or Google Gemini), through our server or directly."),
        ("Speaking exercises", "Your voice, while the microphone is on, to turn it into text.", "Your phone's speech recognition service (usually Google). The app does not keep recordings."),
        ("Opinions and “report a problem”", "What you write, the exercise you were on, the app version, the phone model and the app language.", "Our feedback server, which forwards it to the developer."),
        ("Crash reports", "The technical error, the app version, the phone model and the app language. No personal content.", "Our feedback server, so we can fix the bug.")],
  nosell="We do not sell or share your data for advertising, and we do not use it to identify you.",
  perm_h="Permissions", perms=["<b>Microphone</b>: only for speaking exercises, and only when you start one.", "<b>Notifications</b>: for the daily reminder, if you turn it on.", "<b>Internet</b>: for AI exercises, speech recognition and feedback. The rest of the app works offline."],
  kids_h="Children", kids="SuperHSK is not directed at children under 13 and does not knowingly collect their data.",
  del_h="Deleting your data", dele=f'Everything the app stores is on your phone: uninstall the app or clear its data in Android settings to delete it. To ask us to delete a feedback message you sent, write to <a href="mailto:{EMAIL}">{EMAIL}</a>.',
  chg_h="Changes", chg="If this policy changes, we will update this page and its date.",
 ),
 "es": dict(
  title="Política de privacidad – SuperHSK", kicker="Legal", h1="Política de privacidad", upd="Última actualización",
  summary="<b>En resumen:</b> SuperHSK no tiene cuentas, ni anuncios, ni analítica. Tu progreso se guarda solo en tu móvil. Los datos solo salen del móvil cuando usas una función que los necesita (ejercicios con IA, reconocimiento de voz o enviar una opinión), y solo lo que esa función necesita.",
  who_h="Quiénes somos", who=f'SuperHSK es una app para aprender chino hecha por un desarrollador independiente. Para cualquier duda sobre esta política, escribe a <a href="mailto:{EMAIL}">{EMAIL}</a>.',
  local_h="Datos guardados en tu móvil", local="Tu progreso del curso, los repasos, los ajustes y las estadísticas se guardan solo en tu dispositivo. Nosotros no podemos verlos. Si exportas una copia de seguridad, el archivo se guarda donde tú elijas y no nos llega. Desinstalar la app o borrar sus datos lo elimina todo.",
  out_h="Datos que salen de tu móvil", cols=["Función", "Qué se envía", "A quién"],
  rows=[("Ejercicios con IA", "El texto del ejercicio y tu respuesta. Ni nombre, ni cuenta, ni contactos.", "El servicio de IA que responde (Groq o Google Gemini), a través de nuestro servidor o directamente."),
        ("Ejercicios de hablar", "Tu voz, mientras el micrófono está activo, para pasarla a texto.", "El reconocimiento de voz de tu móvil (normalmente Google). La app no guarda grabaciones."),
        ("Opiniones y «avisar de un fallo»", "Lo que escribes, el ejercicio en el que estabas, la versión de la app, el modelo del móvil y el idioma de la app.", "Nuestro servidor de opiniones, que se lo pasa al desarrollador."),
        ("Informes de cierres", "El error técnico, la versión de la app, el modelo del móvil y el idioma de la app. Nada de contenido personal.", "Nuestro servidor de opiniones, para poder arreglar el fallo.")],
  nosell="No vendemos ni compartimos tus datos para publicidad, y no los usamos para identificarte.",
  perm_h="Permisos", perms=["<b>Micrófono</b>: solo para los ejercicios de hablar, y solo cuando empiezas uno.", "<b>Notificaciones</b>: para el recordatorio diario, si lo activas.", "<b>Internet</b>: para la IA, el reconocimiento de voz y las opiniones. El resto de la app funciona sin conexión."],
  kids_h="Menores", kids="SuperHSK no está dirigida a menores de 13 años y no recoge sus datos a sabiendas.",
  del_h="Borrar tus datos", dele=f'Todo lo que guarda la app está en tu móvil: desinstala la app o borra sus datos en los ajustes de Android para eliminarlo. Para pedirnos que borremos una opinión que enviaste, escribe a <a href="mailto:{EMAIL}">{EMAIL}</a>.',
  chg_h="Cambios", chg="Si esta política cambia, actualizaremos esta página y su fecha.",
 ),
}


def privacy(lang):
    t, p = T[lang], P[lang]
    pre = "" if lang == "en" else "../"
    other = "es/privacidad.html" if lang == "en" else "../privacy.html"
    priv = "privacy.html" if lang == "en" else "privacidad.html"
    rows = "".join(
        f'<div class="drow"><div><span class="h">{p["cols"][0]}</span><b>{a}</b></div><div><span class="h">{p["cols"][1]}</span><span>{b}</span></div>'
        f'<div><span class="h">{p["cols"][2]}</span><span>{c}</span></div></div>' for a, b, c in p["rows"])
    perms = "".join(f"<li>{x}</li>" for x in p["perms"])
    canon = "privacy.html" if lang == "en" else "es/privacidad.html"
    return head(lang, p["title"], t["desc"], pre, canon) + nav(t, pre, "./", priv, other, anchors=False) + f"""
<div class="doc-hero"><div class="wrap"><span class="kicker" style="color:var(--gold)">{p["kicker"]}</span><h1>{p["h1"]}</h1><p>SuperHSK · {p["upd"]}: {UPDATED[lang]}</p></div></div>
<main class="doc">
<div class="summary">{p["summary"]}</div>
<h2>{p["who_h"]}</h2><p>{p["who"]}</p>
<h2>{p["local_h"]}</h2><p>{p["local"]}</p>
<h2>{p["out_h"]}</h2><div class="dtable">{rows}</div><p>{p["nosell"]}</p>
<h2>{p["perm_h"]}</h2><ul>{perms}</ul>
<h2>{p["kids_h"]}</h2><p>{p["kids"]}</p>
<h2>{p["del_h"]}</h2><p>{p["dele"]}</p>
<h2>{p["chg_h"]}</h2><p>{p["chg"]}</p>
</main>
""" + footer(t, "./", priv, other) + f'<script src="{pre}assets/site.js"></script>\n</body>\n</html>\n'


def main():
    (ROOT / "es").mkdir(exist_ok=True)
    (ROOT / "index.html").write_text(landing("en"), encoding="utf-8")
    (ROOT / "es/index.html").write_text(landing("es"), encoding="utf-8")
    (ROOT / "privacy.html").write_text(privacy("en"), encoding="utf-8")
    (ROOT / "es/privacidad.html").write_text(privacy("es"), encoding="utf-8")


if __name__ == "__main__":
    main()
