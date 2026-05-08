import os

def update_principal():
    path = '/home/josemendozaalonso097/proyecto-juasjaus/frontend/principal/index.html'
    with open(path, 'r') as f:
        lines = f.readlines()
    
    # Keep up to line 148 (index 147)
    # The last 4 lines are scripts and body closing
    new_lines = lines[:148] + [
        '\n',
        '<!-- Injected Modal Containers -->\n',
        '<div id="modal-historial-container"></div>\n',
        '<div id="modal-informacion-container"></div>\n',
        '<div id="modal-detalle-container"></div>\n',
        '<div id="modal-pago-container"></div>\n',
        '<div id="modal-papeleria-container"></div>\n',
        '<div id="modal-perfil-container"></div>\n',
        '<div id="modal-orientacion-container"></div>\n',
        '\n'
    ] + lines[-4:]
    
    with open(path, 'w') as f:
        f.writelines(new_lines)
    print("Updated principal/index.html")

def update_tienda():
    path = '/home/josemendozaalonso097/proyecto-juasjaus/frontend/tienda/tienda.html'
    with open(path, 'r') as f:
        lines = f.readlines()
    
    # Store modals from line 167 onwards. 
    # Let's find exactly where <div class="modal" id="productModal"> starts
    start_idx = -1
    for i, line in enumerate(lines):
        if 'id="productModal"' in line:
            start_idx = i
            break
            
    if start_idx != -1:
        new_lines = lines[:start_idx] + [
            '\n',
            '<!-- Injected Modal Containers -->\n',
            '<div id="modal-productos-container"></div>\n',
            '<div id="modal-pago-container"></div>\n',
            '<div id="modal-papeleria-container"></div>\n',
            '<div id="modal-perfil-container"></div>\n',
            '\n'
        ] + lines[-5:] # jspdf, module, body, html
        
        with open(path, 'w') as f:
            f.writelines(new_lines)
        print("Updated tienda/tienda.html")
    else:
        print("Could not find productModal in tienda.html")

update_principal()
update_tienda()
