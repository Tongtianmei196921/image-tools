document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const toolbar = document.querySelector('.toolbar');

    // 状态管理
    const state = {
        currentImage: null,
        rotation: 0,
        isFlipped: false,
        originalImage: null
    };

    // 点击上传
    uploadBox.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件选择处理
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // 拖放处理
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadBox.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // 文件处理函数
    function handleFile(file) {
        // 检查文件类型
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showMessage('请上传 JPG、PNG、WebP 或 GIF 格式的图片', 'error');
            return;
        }

        // 检查文件大小（限制为 10MB）
        if (file.size > 10 * 1024 * 1024) {
            showMessage('图片大小不能超过 10MB', 'error');
            return;
        }

        // 读取文件
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                state.originalImage = img;
                state.currentImage = img;
                displayImage(img);
                toolbar.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 显示图片
    function displayImage(img) {
        uploadBox.innerHTML = '';
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置画布大小
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 应用变换
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(state.rotation * Math.PI/180);
        if (state.isFlipped) ctx.scale(-1, 1);
        ctx.translate(-canvas.width/2, -canvas.height/2);
        
        // 绘制图片
        ctx.drawImage(img, 0, 0);
        
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
        uploadBox.appendChild(canvas);
    }

    // 工具按钮点击处理
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!state.currentImage) return;

            const tool = btn.dataset.tool;
            switch(tool) {
                case 'rotate':
                    state.rotation = (state.rotation + 90) % 360;
                    displayImage(state.currentImage);
                    break;
                case 'flip':
                    state.isFlipped = !state.isFlipped;
                    displayImage(state.currentImage);
                    break;
                case 'format':
                    handleFormatConversion();
                    break;
            }
        });
    });

    // 格式转换处理
    function handleFormatConversion() {
        const canvas = uploadBox.querySelector('canvas');
        if (!canvas) return;

        const formats = [
            { name: 'JPG', type: 'image/jpeg' },
            { name: 'PNG', type: 'image/png' },
            { name: 'WebP', type: 'image/webp' }
        ];

        // 创建格式选择对话框
        const dialog = document.createElement('div');
        dialog.className = 'format-dialog';
        dialog.innerHTML = `
            <div class="format-options">
                <h3>选择输出格式</h3>
                <div class="format-buttons">
                    ${formats.map(f => `
                        <button class="format-btn" data-format="${f.type}">${f.name}</button>
                    `).join('')}
                </div>
            </div>
        `;

        // 添加样式
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        // 添加点击事件
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });

        // 格式按钮点击处理
        dialog.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                const dataUrl = canvas.toDataURL(format, 0.8);
                
                // 创建下载链接
                const link = document.createElement('a');
                const timestamp = new Date().getTime();
                const extension = format.split('/')[1];
                link.download = `converted-image-${timestamp}.${extension}`;
                link.href = dataUrl;
                link.click();

                dialog.remove();
                showMessage('格式转换成功！', 'success');
            });
        });

        document.body.appendChild(dialog);
    }

    // 显示消息提示
    function showMessage(message, type = 'info') {
        const div = document.createElement('div');
        div.className = `message ${type}`;
        div.textContent = message;
        div.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 4px;
            color: white;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;

        // 设置背景色
        switch(type) {
            case 'success':
                div.style.backgroundColor = '#4CAF50';
                break;
            case 'error':
                div.style.backgroundColor = '#f44336';
                break;
            default:
                div.style.backgroundColor = '#2196F3';
        }

        document.body.appendChild(div);
        setTimeout(() => {
            div.style.opacity = '0';
            div.style.transition = 'opacity 0.3s ease';
            setTimeout(() => div.remove(), 300);
        }, 3000);
    }
});
