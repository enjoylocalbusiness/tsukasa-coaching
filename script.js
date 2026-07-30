document.addEventListener('DOMContentLoaded', () => {
    // 1. 雲タグの選択処理（最大5つまで）
    const cloudTags = document.querySelectorAll('.cloud-tag');
    const selectedTagsInput = document.getElementById('selectedTagsInput');
    const selectedCountSpan = document.getElementById('selectedCount');
    let selectedTags = [];

    cloudTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const value = tag.getAttribute('data-value');
            
            if (tag.classList.contains('selected')) {
                tag.classList.remove('selected');
                selectedTags = selectedTags.filter(item => item !== value);
            } else {
                if (selectedTags.length >= 5) {
                    alert('相談内容は最大5つまで選択できます。');
                    return;
                }
                tag.classList.add('selected');
                selectedTags.push(value);
            }

            selectedCountSpan.textContent = selectedTags.length;
            selectedTagsInput.value = selectedTags.join(', ');
            
            // 選択されている場合はバリデーションエラーをクリア
            if (selectedTags.length > 0) {
                selectedTagsInput.setCustomValidity('');
            } else {
                selectedTagsInput.setCustomValidity('少なくとも1つ選択してください。');
            }
        });
    });

    // 初期状態でバリデーション設定
    selectedTagsInput.setCustomValidity('少なくとも1つ選択してください。');

    // 2. 知り合い判定による料金切り替え
    const acquaintanceRadios = document.querySelectorAll('input[name="acquaintance"]');
    const normalPrices = document.querySelectorAll('.normal-price');
    const freePrices = document.querySelectorAll('.free-price');

    acquaintanceRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isAcquaintance = e.target.value === 'yes' || e.target.value === 'はい';

            normalPrices.forEach(el => {
                if (isAcquaintance) {
                    el.classList.add('strike');
                } else {
                    el.classList.remove('strike');
                }
            });

            freePrices.forEach(el => {
                el.style.display = isAcquaintance ? 'inline-block' : 'none';
            });
        });
    });

    // 3. フォーム送信処理（スプレッドシート連携用プレースホルダー）
    const form = document.getElementById('coachingForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (selectedTags.length === 0) {
            alert('相談内容を少なくとも1つ選択してください。');
            return;
        }

        // 送信ボタンを無効化してローディング風に
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中...';

        // フォームデータの収集
        const formData = {
            tags: selectedTagsInput.value,
            acquaintance: document.querySelector('input[name="acquaintance"]:checked').value,
            duration: document.querySelector('input[name="duration"]:checked').value,
            instagramId: document.getElementById('instagramId').value,
            nickname: document.getElementById('nickname').value
        };

        // Googleスプレッドシートへ送信
        fetch('https://script.google.com/macros/s/AKfycbxa0a4bS25dOgYbXeGbnFBtUvGYu3x4VeouqKdp0s0o08NJFfKzAIPdmNvvPK8gQJXe/exec', {
            method: 'POST',
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('成功:', data);
        })
        .catch((error) => {
            console.error('エラー:', error);
        });

        // 送信完了の演出
        setTimeout(() => {
            form.reset();
            cloudTags.forEach(t => t.classList.remove('selected'));
            selectedCountSpan.textContent = '0';
            
            // 表示切替
            form.querySelectorAll('.form-group, .submit-btn').forEach(el => el.style.display = 'none');
            successMessage.style.display = 'block';
        }, 1000);
    });
});
