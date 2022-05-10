import os
import shutil

DIR_SRC = ".\\markdown"
DIR_DST = ".\\html"


def handleDirectory(directory):
    dst = directory.replace(DIR_SRC, DIR_DST)
    if not os.path.exists(dst):
        print("creating " + dst)
        os.makedirs(dst)


def handleMarkdown(directory, filename):
    src = root + "\\" + file
    dst = root.replace(DIR_SRC, DIR_DST) + "\\" + file.replace(".md", ".html")
    cmd = "pandoc " \
          + src \
          + " -o " + dst \
          + " --to html5+smart" \
          + " --lua-filter ./build_resources/links-to-html.lua" \
          + " --standalone" \
          + " --template ./build_resources/template.html" \
          + " --include-in-header ./build_resources/style.html" \
          + " --include-in-header ./build_resources/code-style.html" \
          + " --toc" \
          + " --number-sections"
    print("building " + src + "  ->  " + dst)
    os.system(cmd)


def handleResource(directory, filename):
    if os.path.isfile:
        src = root + "\\" + file
        dst = root.replace(DIR_SRC, DIR_DST) + "\\" + file
        print("copying " + src + "  ->  " + dst)
        shutil.copyfile(src, dst)


for root, dir, files in os.walk(DIR_SRC):
    handleDirectory(root)
    for file in files:
        if file.endswith(".md"):
            handleMarkdown(root, file)
        else:
            handleResource(root, file)
