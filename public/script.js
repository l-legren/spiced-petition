
const canvas = $("#canvas");
var ctx = canvas[0].getContext("2d");
var savedSignature;
const signFile = $("#signature-file");

console.log(canvas);

canvas.on("mousedown", (e) => {

    const canvasX = canvas.offset().left;
    const canvasY = canvas.offset().top;
    const currentX = e.pageX;
    const currentY = e.pageY;

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";

    console.log(e.pageX + 50, e.pageY + 50);

    ctx.moveTo(currentX - canvasX, currentY - canvasY);

    canvas.on("mousemove", (moving) => {
        console.log(moving.pageX);
        ctx.lineTo(moving.pageX - canvasX, moving.pageY - canvasY);
        // savedSignature = canvas.toDataURL();
        // signFile.val(savedSignature);
        // console.log(signFile);
        ctx.stroke();
    });

});

canvas.on("mouseup", () => {
    canvas.unbind("mousemove");
});