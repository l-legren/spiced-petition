
const canvas = $("#canvas");
var ctx = canvas[0].getContext("2d");
let moving = false;
let dataURL;
const signFile = $("#signature-file");

console.log(canvas);

const signing = (e) => {
    if (!moving) return;
    ctx.lineWidth = 2;
    ctx.linecap = "round";
    // console.log(canvas.offset().left, canvas.offset().top);
    console.log(
        e.pageX - canvas.offset().left,
        e.pageY - canvas.offset().top
    );
    ctx.lineTo(
        e.pageX - canvas.offset().left,
        e.pageY - canvas.offset().top
    );
    ctx.stroke();
    dataURL = canvas[0].toDataURL();
    signFile.val(dataURL);
    console.log(signFile);
};

canvas.on("mousedown", (e) => {
    moving = true;
    signing(e);
});
canvas.on("mouseup", () => {
    moving = false;
    ctx.beginPath();
});

canvas.on("mousemove", signing);