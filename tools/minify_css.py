"""Write minified copies of the stylesheets the pages load.

    python tools/minify_css.py

assets/style.css  -> assets/style.min.css   (main page)
assets/design.css -> assets/design.min.css  (design portfolio pages)

Edit the .css files, never the .min.css files; run this afterwards.
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(os.path.dirname(HERE), "assets")


def minify(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)          # comments
    css = re.sub(r"\s+", " ", css)                            # runs of whitespace
    css = re.sub(r"\s*([{};,])\s*", r"\1", css)               # around braces, semicolons, commas
    # Inside declaration blocks only (never selectors): the space after a property's colon.
    css = re.sub(r"\{([^{}]*)\}", lambda m: "{" + re.sub(r":\s+", ":", m.group(1)) + "}", css)
    css = css.replace(";}", "}")
    return css.strip() + "\n"


def main():
    for name in ("style", "design"):
        src = os.path.join(ASSETS, name + ".css")
        out = os.path.join(ASSETS, name + ".min.css")
        text = open(src, encoding="utf-8").read()
        small = minify(text)
        assert small.count("{") == small.count("}") == text.count("{"), f"{name}: brace count changed"
        with open(out, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(small)
        print(f"{name}.css {len(text) / 1024:.0f} KB -> {name}.min.css {len(small) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
