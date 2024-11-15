document.addEventListener('DOMContentLoaded', () => {
    // 在原有的 state 对象中添加格式相关状态
    const state = {
        // ... 原有的状态 ...
        selectedFormat: 'image/jpeg',
        quality: 0.8
    };

    // 在原有的 elements 对象中添加格式转换相关元素
    const elements = {
        // ... 原有的元素 ...
        formatDialog: document.querySelector('.format-dialog'),
        formatButtons: document.querySelectorAll('.format-btn'),
        qualitySlider: document.getElementById('quality'),
        qualityValue: document.getElementById('qualityValue')
    };

    // 在工具按钮点击处理中添加格式转换处理
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;
            switch(tool) {
                // ... 原有的 case ...
                case 'format':
                    showFormatDialog();
                    break;
            }
        });
    });

    // 格式转换相关函数
    function showFormatDialog() {
        elements.formatDialog.style.display = 'flex';
        updateFormatButtons();
    }

    function updateFormatButtons() {
        elements.formatButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === state.selectedFormat);
        });
    }

    // 格式按钮点击事件
    elements.formatButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            state.selectedFormat = btn.dataset.format;
            updateFormatButtons();
        });
    });

    // 质量滑块事件
    elements.qualitySlider.addEventListener('input', (e) => {
        state.quality = e.target.value / 100;
        elements.qualityValue.textContent = `${e.target.value}%`;
    });

    // 转换格式
    function convertFormat() {
        const canvas = elements.uploadBox.querySelector('canvas');
        if (!canvas) return;

        try {
            // 创建新的画布以保持原始质量
            const newCanvas = document.createElement('canvas');
            const ctx = newCanvas.getContext('2d');
            newCanvas.width = canvas.width;
            newCanvas.height = canvas.height;
            ctx.drawImage(canvas, 0, 0);

            // 转换格式
            const dataUrl = newCanvas.toDataURL(state.selectedFormat, state.quality);
            
            // 创建下载链接
            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            const format = state.selectedFormat.split('/')[1];
            link.download = `converted-image-${timestamp}.${format}`;
            link.href = dataUrl;
            link.click();

            // 隐藏对话框
            elements.formatDialog.style.display = 'none';
            
            showSuccess('格式转换成功！');
        } catch (error) {
            showError('格式转换失败，请重试');
            console.error(error);
        }
    }

    // 显示成功消息
    function showSuccess(message, duration = 3000) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        setTimeout(() => {
            successDiv.style.opacity = '0';
            successDiv.style.transition = 'opacity 0.3s ease';
            setTimeout(() => successDiv.remove(), 300);
        }, duration);
    }

    // 格式对话框按钮事件
    document.querySelector('.format-dialog .apply-btn').addEventListener('click', convertFormat);
    document.querySelector('.format-dialog .cancel-btn').addEventListener('click', () => {
        elements.formatDialog.style.display = 'none';
    });

    // 点击对话框外部关闭
    elements.formatDialog.addEventListener('click', (e) => {
        if (e.target === elements.formatDialog) {
            elements.formatDialog.style.display = 'none';
        }
    });
});
