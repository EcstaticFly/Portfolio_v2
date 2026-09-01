/**
 * Resolves the theme before the first paint.
 *
 * This has to be a blocking inline script in <head>. A post-mount effect
 * would paint the default theme first and then correct it, which is the
 * flash we are avoiding. It reads the stored choice, falls back to the
 * OS preference, and writes the attribute the stylesheet keys off.
 */
const script = `(function(){try{var s=localStorage.getItem("theme");var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export function ThemeScript() {
  return (
    <script
      // Static, self-authored string with no interpolation.
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
