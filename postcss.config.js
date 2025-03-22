// ✅ postcss.config.js – Final NordBalticum Premium Config

module.exports = {
  plugins: {
    // ✅ Leidžia naudoti @import failų modulius
    "postcss-import": {},

    // ✅ Mixins kaip SCSS (jei naudoji repeat rules)
    "postcss-mixins": {},

    // ✅ Nesting kaip SCSS/CSS4 – leidžia rašyti .box { .child { ... } }
    "tailwindcss/nesting": {},

    // ✅ Pagrindinis Tailwind variklis
    tailwindcss: {},

    // ✅ Autoprefixer visoms naršyklėms (Safari, Edge, iOS ir pan.)
    autoprefixer: {},

    // ✅ Fix’ai visiems flexbox bug’ams visose naršyklėse
    "postcss-flexbugs-fixes": {},

    // ✅ CSS4 galimybės (nesting, custom media, media ranges)
    "postcss-preset-env": {
      stage: 3,
      features: {
        "nesting-rules": true,
        "custom-media-queries": true,
        "media-query-ranges": true,
      },
    },
  },
};
