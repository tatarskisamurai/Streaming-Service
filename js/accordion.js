// Accordion functionality
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        const content = item.querySelector('.accordion-content');
        const isOpen = item.classList.contains('open');

        // Toggle current
        if (isOpen) {
            item.classList.remove('open');
            content.style.maxHeight = null;
        } else {
            item.classList.add('open');
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    });
});

// Set initial height for open item
document.querySelectorAll('.accordion-item.open').forEach(item => {
    const content = item.querySelector('.accordion-content');
    content.style.maxHeight = content.scrollHeight + 'px';
});