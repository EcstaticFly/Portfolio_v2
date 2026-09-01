/**
 * Resolves the theme before the first paint.
 *
 * This has to be a blocking inline script in <head>. A post-mount effect
 * would paint the default theme first and then correct it, which is the
 * flash we are avoiding.
 *
 * Dark is the deliberate default for first-time visitors, regardless of
 * the OS setting. A stored choice always wins over it.
 */
const script = `(function(){try{var s=localStorage.getItem("theme");var t=(s==="light"||s==="dark")?s:"dark";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export function ThemeScript() {
  return (
    <script
      // Static, self-authored string with no interpolation.
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
