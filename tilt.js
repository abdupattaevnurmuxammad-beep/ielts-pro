document.querySelectorAll(".card, .stat-card, .streak-card").forEach(card => {

    card.style.transformStyle = "preserve-3d";
    card.style.transition = "transform 0.1s ease-out, box-shadow 0.3s ease";

    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform =
            `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform =
            "perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)";
    });

});