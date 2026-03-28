import os
import re

def add_css_link(filepath, link_tag):
    with open(filepath, 'r') as f:
        content = f.read()
    if link_tag not in content:
        content = content.replace('</head>', f'    {link_tag}\n</head>')
        with open(filepath, 'w') as f:
            f.write(content)

add_css_link('/home/josemendozaalonso097/proyecto-juasjaus/frontend/login.html', '<link rel="stylesheet" href="css/base.css">')
add_css_link('/home/josemendozaalonso097/proyecto-juasjaus/frontend/principal/index.html', '<link rel="stylesheet" href="../css/base.css">')
add_css_link('/home/josemendozaalonso097/proyecto-juasjaus/frontend/tienda/tienda.html', '<link rel="stylesheet" href="../css/base.css">')

def replace_colors_in_css(filepath):
    print(f"Replacing colors in {filepath}")
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = re.sub(r'#f20d0d', 'var(--color-primary)', content, flags=re.IGNORECASE)
    content = re.sub(r'#94272c', 'var(--color-primary-dark)', content, flags=re.IGNORECASE)
    content = re.sub(r'#6e0404', 'var(--color-primary-darker)', content, flags=re.IGNORECASE)
    content = re.sub(r'#750616', 'var(--color-primary-gradient)', content, flags=re.IGNORECASE)
    
    with open(filepath, 'w') as f:
        f.write(content)

replace_colors_in_css('/home/josemendozaalonso097/proyecto-juasjaus/frontend/login.css')
replace_colors_in_css('/home/josemendozaalonso097/proyecto-juasjaus/frontend/principal/principal.css')
replace_colors_in_css('/home/josemendozaalonso097/proyecto-juasjaus/frontend/tienda/tienda.css')
