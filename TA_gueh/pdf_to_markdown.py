#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script untuk mengkonversi PDF ke Markdown
"""

import sys
import re

def extract_text_from_pdf_pypdf2(pdf_path):
    """Menggunakan PyPDF2 untuk mengekstrak teks"""
    try:
        import PyPDF2
        text_content = []
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            print(f"Total halaman: {num_pages}")
            
            for page_num in range(num_pages):
                print(f"Membaca halaman {page_num + 1}/{num_pages}...")
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                if text.strip():
                    text_content.append(f"--- Halaman {page_num + 1} ---\n{text}\n")
            
        return "\n".join(text_content)
    except ImportError:
        print("PyPDF2 tidak ditemukan, mencoba pdfplumber...")
        return None

def extract_text_from_pdf_pdfplumber(pdf_path):
    """Menggunakan pdfplumber untuk mengekstrak teks (lebih akurat)"""
    try:
        import pdfplumber
        text_content = []
        
        with pdfplumber.open(pdf_path) as pdf:
            num_pages = len(pdf.pages)
            print(f"Total halaman: {num_pages}")
            
            for page_num, page in enumerate(pdf.pages, 1):
                print(f"Membaca halaman {page_num}/{num_pages}...")
                text = page.extract_text()
                if text:
                    text_content.append(f"--- Halaman {page_num} ---\n{text}\n")
        
        return "\n".join(text_content)
    except ImportError:
        print("pdfplumber tidak ditemukan, mencoba PyPDF2...")
        return None

def clean_text_for_markdown(text):
    """Membersihkan dan memformat teks untuk Markdown"""
    # Hapus karakter kontrol yang tidak diperlukan
    text = re.sub(r'\x00', '', text)
    
    # Normalisasi whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Deteksi dan format heading (huruf besar di awal baris mungkin heading)
    lines = text.split('\n')
    formatted_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            formatted_lines.append('')
            continue
        
        # Skip halaman markers
        if line.startswith('--- Halaman'):
            formatted_lines.append(f"\n## {line}\n")
            continue
        
        # Deteksi kemungkinan heading (baris pendek, semua huruf besar atau judul)
        if len(line) < 100 and line.isupper() and len(line.split()) < 10:
            formatted_lines.append(f"\n## {line}\n")
        elif len(line) < 80 and line[0].isupper() and len(line.split()) < 8:
            # Mungkin subheading
            if not line.endswith('.') and not line.endswith(','):
                formatted_lines.append(f"\n### {line}\n")
            else:
                formatted_lines.append(line)
        else:
            formatted_lines.append(line)
    
    return '\n'.join(formatted_lines)

def pdf_to_markdown(pdf_path, output_path=None):
    """Fungsi utama untuk konversi PDF ke Markdown"""
    
    if output_path is None:
        output_path = pdf_path.replace('.pdf', '.md')
    
    print(f"Membaca file: {pdf_path}")
    
    # Coba dengan pdfplumber dulu (lebih akurat)
    text = extract_text_from_pdf_pdfplumber(pdf_path)
    
    # Jika gagal, coba PyPDF2
    if text is None:
        text = extract_text_from_pdf_pypdf2(pdf_path)
    
    if text is None:
        print("ERROR: Tidak dapat mengekstrak teks. Pastikan PyPDF2 atau pdfplumber sudah terinstall.")
        print("Install dengan: pip install PyPDF2 pdfplumber")
        return False
    
    # Bersihkan dan format untuk Markdown
    print("Memformat ke Markdown...")
    markdown_text = clean_text_for_markdown(text)
    
    # Tambahkan header
    header = f"""# Laporan UAS ECE

> Dikonversi dari PDF: {pdf_path}

---

"""
    
    final_markdown = header + markdown_text
    
    # Simpan ke file
    print(f"Menyimpan ke: {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(final_markdown)
    
    print(f"Selesai! File Markdown disimpan di: {output_path}")
    return True

if __name__ == "__main__":
    pdf_file = r"c:\Users\USER\Downloads\Folder-Farras_bappenda_TA\TA_gueh\Laporan UAS ECE.pdf"
    pdf_to_markdown(pdf_file)
