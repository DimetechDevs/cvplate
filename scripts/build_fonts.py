"""Turn upstream Google Fonts files into static, subset TTFs for the PDF renderer.

Usage: python3 -I scripts/build_fonts.py <fontsrc dir> <out dir>
"""
import sys, os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

# Latin, Latin-1, Latin Extended A/B + Additional (Vietnamese), Greek, Cyrillic, punctuation, currency, arrows/bullets.
UNICODES = "U+0000-024F,U+0259,U+02B0-02FF,U+0300-036F,U+0370-03FF,U+0400-04FF,U+1E00-1EFF,U+2000-206F,U+20A0-20CF,U+2100-214F,U+2190-21FF,U+2212,U+2215,U+25CF,U+25E6,U+FEFF,U+FFFD"

# family -> [(source file, axes or None, output weight, style)]
def var(name, upright, italic, weights, opsz=None):
    out = []
    for w in weights:
        axes = {"wght": w}
        if opsz: axes["opsz"] = opsz
        out.append((upright, axes, w, "normal"))
    out.append((italic or upright, {"wght": 400, **({"opsz": opsz} if opsz else {})}, 400, "italic" if italic else "normal-dup"))
    return name, out

FAMILIES = [
    ("Carlito", [("Carlito-Regular.ttf", None, 400, "normal"), ("Carlito-Bold.ttf", None, 700, "normal"), ("Carlito-Italic.ttf", None, 400, "italic"), ("Carlito-BoldItalic.ttf", None, 700, "italic")]),
    ("Caladea", [("Caladea-Regular.ttf", None, 400, "normal"), ("Caladea-Bold.ttf", None, 700, "normal"), ("Caladea-Italic.ttf", None, 400, "italic"), ("Caladea-BoldItalic.ttf", None, 700, "italic")]),
    var("Gelasio", "Gelasio[wght].ttf", "Gelasio-Italic[wght].ttf", [400, 600, 700]),
    var("SourceSans3", "SourceSans3[wght].ttf", "SourceSans3-Italic[wght].ttf", [400, 600, 700]),
    var("EBGaramond", "EBGaramond[wght].ttf", "EBGaramond-Italic[wght].ttf", [400, 600, 700]),
    ("IBMPlexSans", [(f, {"wght": w, "wdth": 100}, w, s) for f, w, s in [("IBMPlexSans[wdth,wght].ttf", 400, "normal"), ("IBMPlexSans[wdth,wght].ttf", 600, "normal"), ("IBMPlexSans[wdth,wght].ttf", 700, "normal"), ("IBMPlexSans-Italic[wdth,wght].ttf", 400, "italic")]]),
    var("LibreFranklin", "LibreFranklin[wght].ttf", "LibreFranklin-Italic[wght].ttf", [400, 600, 700]),
    var("Inter", "Inter[opsz,wght].ttf", "Inter-Italic[opsz,wght].ttf", [400, 600, 700], opsz=14),
    var("SourceSerif4", "SourceSerif4[opsz,wght].ttf", None, [400, 600, 700], opsz=12),
]

opts = subset.Options()
opts.layout_features = ["kern", "liga", "tnum", "lnum", "onum", "smcp", "c2sc", "case", "ccmp", "locl", "mark", "mkmk"]
opts.hinting = False
opts.name_IDs = ["*"]
opts.notdef_outline = True
opts.glyph_names = False

for family, faces in FAMILIES:
    for src, axes, weight, style in faces:
        if style == "normal-dup":
            continue
        f = TTFont(os.path.join(SRC, src))
        if axes:
            axes = {k: v for k, v in axes.items() if k in [a.axisTag for a in f["fvar"].axes]}
            f = instancer.instantiateVariableFont(f, axes, updateFontNames=False)
        s = subset.Subsetter(opts)
        s.populate(unicodes=subset.parse_unicodes(UNICODES))
        s.subset(f)
        name = f"{family}-{weight}{'-italic' if style == 'italic' else ''}.ttf"
        f.save(os.path.join(OUT, name))
        print(name, os.path.getsize(os.path.join(OUT, name)))
