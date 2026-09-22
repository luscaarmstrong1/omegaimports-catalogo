import os
import glob
from PIL import Image, ImageChops

base_dir = "reports/visual-parity"
mockups_dir = "reference-mockups"

# Mapeamento oficial definido em reports/mockup-reference-final.md
mapping = {
    "faq": "ChatGPT Image 19_09_2026, 20_48_50 (2).png",
    "privacy": "ChatGPT Image 19_09_2026, 20_48_50 (4).png",
    "terms": "ChatGPT Image 19_09_2026, 20_48_51 (6).png",
    "how-to-buy": "ChatGPT Image 19_09_2026, 20_48_51 (8).png",
    "categories": "ChatGPT Image 19_09_2026, 20_56_35 (1).png",
    "blog": "ChatGPT Image 19_09_2026, 20_56_36 (6).png",
    "about": "ChatGPT Image 19_09_2026, 20_56_36 (5).png",
    "contact": "ChatGPT Image 19_09_2026, 20_59_10 (3).png",
}

print("Iniciando geração de reference, overlay e diff...")

for route_key, mockup_file in mapping.items():
    route_dir = os.path.join(base_dir, route_key)
    ref_src = os.path.join(mockups_dir, mockup_file)
    ref_dst = os.path.join(route_dir, "reference.png")
    current_dst = os.path.join(route_dir, "current.png")
    overlay_dst = os.path.join(route_dir, "overlay.png")
    diff_dst = os.path.join(route_dir, "diff.png")

    if not os.path.exists(ref_src):
        print(f"[-] Mockup não encontrado: {ref_src}")
        continue

    # 1. Copiar / salvar reference
    ref_img = Image.open(ref_src).convert("RGB")
    ref_img.save(ref_dst)

    # 2. Verificar se current.png existe
    if os.path.exists(current_dst):
        curr_img = Image.open(current_dst).convert("RGB")
        
        # Redimensionar current para bater exatamente com as dimensões do reference para overlay/diff justo
        curr_resized = curr_img.resize(ref_img.size, Image.Resampling.LANCZOS)

        # 3. Gerar overlay (50% mockup, 50% site)
        overlay = Image.blend(ref_img, curr_resized, 0.5)
        overlay.save(overlay_dst)

        # 4. Gerar diff (diferença absoluta)
        diff = ImageChops.difference(ref_img, curr_resized)
        # Realçar diff visualmente para auditoria
        diff_enhanced = diff.point(lambda p: min(255, p * 2))
        diff_enhanced.save(diff_dst)

        print(f"[+] Processado: {route_key} -> reference, overlay e diff gerados.")
    else:
        print(f"[!] Aguardando current.png para {route_key}")

print("Concluído.")
