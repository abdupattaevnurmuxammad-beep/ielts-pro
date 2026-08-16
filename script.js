// ============================================
// IELTS PRO — Global nav + homepage counters
// ============================================

function goHome(){
    window.location.href = "index.html";
}

function goPractice(){
    window.location.href = "practice.html";
}
function goDashboard(){
    window.location.href = "dashboard.html";
}
// Animated Counters (only runs if .counter elements exist on the page)
const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {
    const updateCounter = () => {
        const target = +counter.dataset.target;
        const current = +counter.innerText;
        const increment = Math.ceil(target / 120);
        if (current < target) {
            counter.innerText = current + increment;
            setTimeout(updateCounter, 20);
        } else {
            counter.innerText = target.toLocaleString() + "+";
        }
    };
    updateCounter();
});