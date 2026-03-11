// Simple FAQ CMS page controller
(function() {
    const state = {
        isAdmin: false,
        editingId: null,
        uploading: false
    };

    function initTinyMCE() {
        tinymce.init({
            selector: '#faqEditor',
            height: 420,
            menubar: false,
            plugins: 'link image lists table code autoresize',
            toolbar: 'undo redo | styles | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image table | code',
            images_upload_handler: async function (blobInfo, success, failure) {
                try {
                    if (state.uploading) return failure('Masih mengunggah...');
                    state.uploading = true;
                    const form = new FormData();
                    form.append('image', blobInfo.blob(), blobInfo.filename());
                    const res = await fetch('/api/faq/upload', {
                        method: 'POST',
                        credentials: 'include',
                        body: form
                    });
                    const json = await res.json();
                    state.uploading = false;
                    if (!res.ok || !json.success) return failure(json.message || 'Upload gagal');
                    success(json.url);
                } catch (e) {
                    state.uploading = false;
                    failure(e.message || 'Upload error');
                }
            }
        });
    }

    async function checkAdmin() {
        try {
            const res = await fetch('/api/profile', { credentials: 'include' });
            const json = await res.json();
            state.isAdmin = (json?.divisi === 'Administrator');
            const adminBar = document.getElementById('adminActions');
            if (state.isAdmin) adminBar.classList.remove('hidden');
        } catch (_) {}
    }

    function setEditorVisible(visible) {
        const editor = document.getElementById('editorArea');
        const btnSave = document.getElementById('btnSave');
        const btnCancel = document.getElementById('btnCancel');
        if (visible) {
            editor.classList.remove('hidden');
            btnSave.classList.remove('hidden');
            btnCancel.classList.remove('hidden');
        } else {
            editor.classList.add('hidden');
            btnSave.classList.add('hidden');
            btnCancel.classList.add('hidden');
        }
    }

    function clearEditor() {
        document.getElementById('faqTitle').value = '';
        const ed = tinymce.get('faqEditor');
        if (ed) ed.setContent('');
        state.editingId = null;
    }

    async function loadFaqs() {
        const list = document.getElementById('faqList');
        list.innerHTML = '<div>Loading...</div>';
        try {
            const res = await fetch('/api/faq', { credentials: 'include' });
            const json = await res.json();
            if (!json?.success) throw new Error(json?.message || 'Gagal memuat');
            const items = json.data || [];
            if (items.length === 0) {
                list.innerHTML = '<div class="faq-item">Belum ada konten.</div>';
                return;
            }
            list.innerHTML = '';
            items.forEach(it => list.appendChild(renderFaqItem(it)));
        } catch (e) {
            list.innerHTML = `<div class="faq-item">${e.message}</div>`;
        }
    }

    function renderFaqItem(item) {
        const div = document.createElement('div');
        div.className = 'faq-item';
        const toolbar = state.isAdmin ? `
            <div class="actions">
                <button class="btn" data-act="edit" data-id="${item.id}">Edit</button>
                <button class="btn danger" data-act="delete" data-id="${item.id}">Hapus</button>
            </div>
        ` : '';
        div.innerHTML = `
            <h3>${escapeHtml(item.title || 'Tanpa Judul')}</h3>
            <div class="content">${item.html || ''}</div>
            <small>Diperbarui: ${new Date(item.updated_at).toLocaleString('id-ID')}</small>
            ${toolbar}
        `;
        if (state.isAdmin) {
            div.querySelector('[data-act="edit"]').onclick = () => startEdit(item);
            div.querySelector('[data-act="delete"]').onclick = () => deleteFaq(item.id);
        }
        return div;
    }

    function startEdit(item) {
        state.editingId = item?.id || null;
        document.getElementById('faqTitle').value = item?.title || '';
        const ed = tinymce.get('faqEditor');
        if (ed) ed.setContent(item?.html || '');
        setEditorVisible(true);
    }

    async function saveFaq() {
        const title = document.getElementById('faqTitle').value.trim();
        const ed = tinymce.get('faqEditor');
        const html = ed ? ed.getContent() : '';
        if (!title || !html) return alert('Judul dan konten wajib diisi');
        const body = JSON.stringify({ question: title, answer: html });
        const opts = { method: state.editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body };
        const url = state.editingId ? `/api/faq/${state.editingId}` : '/api/faq';
        const res = await fetch(url, opts);
        const json = await res.json();
        if (!res.ok || !json.success) return alert(json.message || 'Gagal menyimpan');
        clearEditor();
        setEditorVisible(false);
        await loadFaqs();
    }

    async function deleteFaq(id) {
        if (!confirm('Hapus konten ini?')) return;
        const res = await fetch(`/api/faq/${id}`, { method: 'DELETE', credentials: 'include' });
        const json = await res.json();
        if (!res.ok || !json.success) return alert(json.message || 'Gagal menghapus');
        await loadFaqs();
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
    }

    // Bind UI
    window.addEventListener('DOMContentLoaded', async () => {
        await checkAdmin();
        initTinyMCE();
        await loadFaqs();

        const btnNew = document.getElementById('btnNew');
        const btnSave = document.getElementById('btnSave');
        const btnCancel = document.getElementById('btnCancel');
        if (btnNew) btnNew.onclick = () => { clearEditor(); setEditorVisible(true); };
        if (btnSave) btnSave.onclick = () => saveFaq();
        if (btnCancel) btnCancel.onclick = () => { clearEditor(); setEditorVisible(false); };
    });
})();


