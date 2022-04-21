/* 先存储全局变量 */
// 标识当前编辑面板的状态
var isTrans = false;
// 编辑面板的遮罩层，避免点击到元素以及避免面板的时间冒泡穿透
var markLayer=document.getElementById("markLayer");
// 编辑面板
var box=document.getElementsByClassName("trans")[0];
var bottomMenu=$(".bottom-menu")[0];
var botteomLeftMenu=$(".left-menu-wrap")[0];
// 是否允许拖动窗口
var isDrag = false;
// 用户编辑输入面板
var editInput = $("#editInput");
// 用户编辑预览面板
var editPreview = $("#editPreview");
// 字数统计
var wordCountdom = $(".word-count");


// markdown编辑部分
var prettyNoteMarkdown;

$(function() {
    prettyNoteMarkdown = editormd("prettyNoteMarkdown", {
        width   : "100%",
        height  : "100%",
        syncScrolling : "single",
        path    : "../frame/markdown_editor/lib/"
    });
});

$(document).ready(function(){
    /* 设置顶层面板右下角时间 */
    var date = new Date();
    $('#curTime').text(date.getFullYear()+"年"+(date.getMonth()+1)+"月"+date.getDate()+"日");

    // 由于设置CSS之后原先的设计失效，故动态添加悬浮指针效果
	$cur_tag = $("#markLayer");
    $cur_tag.hover(function(){
		$cur_tag.css("background-color","rgba(0,0,0,0.2)");
	},function(){
		$cur_tag.css("background-color","rgba(0,0,0,0.3)");
	});

    
    /* 添加窗口拖动效果 */
    var x=0;
    var y=0;
    $(".fill-wrap").mousedown(function(event){
        if(isDrag){
            isDrag=false;
            x=event.screenX;
            y=event.screenY;
        }
        else{
            isDrag=true;
            x=event.screenX;
            y=event.screenY;
        }
    });
    $("body").mouseup(function(){
        isDrag=false;
    });

    $(".fill-wrap").mousemove(function(event){
        if(isDrag){
            // 经测试，1.1倍比较柔和适中且
            // window.moveBy(parseInt(1.1*(event.screenX-x)),parseInt(1.1*(event.screenY-y)));
            
            // console.log(parseInt(event.screenX-x)+","+parseInt(event.screenY-y));
            // window.moveTo(0,event.screenY);
            ipcRenderer.send('windowDrag',[parseInt(1.0*(event.screenX-x)),parseInt(1.0*(event.screenY-y))]);
            // console.log(x,y);
        }
        x=event.screenX;
        y=event.screenY;
    });
});

/* 自定义函数部分 */
// 转换按钮
function clickButton(){
    if(isTrans){	// 已经处于转换状态则不进行转换
        return;
    }
    // 点击后状态为已转换
    isTrans = true;
    // 遮罩层显示
    markLayer.style.display="inline";

    // 面板转换
    box.style.opacity=0.7;
    box.style.borderRadius="10px";
    box.style.transform="scale(0.5, 0.5) translate(60%) rotate(40deg)";

    // 底层面板显现
    bottomMenu.style.opacity=1;
    botteomLeftMenu.style.opacity=1;
}
// 点击面板进行恢复
function recovery(){
    if(!isTrans){	// 已经未处于转换状态则不进行转换
        return;
    }
    // 点击后状态为未转换
    isTrans = false;
    // 遮罩层消失
    markLayer.style.display="none";

    // 面板恢复
    box.style.opacity=1;
    box.style.borderRadius="0px";
    box.style.transform="scale(1, 1) translate(0%) rotate(0deg)";
    
    // 底层面板显现
    bottomMenu.style.opacity=0;
    botteomLeftMenu.style.opacity=0;
}

// 操作窗口
function operAPP(index){
    // console.log(window.innerWidth+" "+window.screen.width);
    // 关闭窗口
    if(index==3){
        // window.close();
        ipcRenderer.send('windowClose');
    }
    // 最大化
    else if(index==2){
        // if(window.outerWidth < window.screen.width-10){
        //     window.resizeTo(window.screen.width,window.screen.height);
        // }
        // else{
        //     window.resizeTo(800,600);
        // }
        ipcRenderer.send('windowMax');//发送消息，窗口最大化
    }
    // 最小化
    else{
        ipcRenderer.send('windowMin');
        // if(window.outerWidth==300){
        //     window.resizeTo(800, 600);
        // }
        // else{
        //     window.resizeTo(300,200);
        //     window.moveTo(window.screen.width-300,window.screen.height-200);
        // }
    }
}

/* 监听窗口变化，主进程通信 */
window.ipcRenderer.on('windowMax', function (event, arg) {
    
})

/* 同步用户的编辑输入到右侧预览框 */
function synchronize(){
    var inputContent = editInput.val();
    editPreview.val(inputContent);
    wordCountdom.text(inputContent.length);
}

var splitTitle = "";
/* 用户点击导出 */
function exportFile(){
    // pdf格式
    var options = {
        orientation: 'p',
        unit: 'pt',
        format: [594.3,840.51]
    }
    // 文档实例
    var doc=new jspdf.jsPDF(options);

    doc.addFileToVFS("simkai.ttf",font);
    doc.addFont("simkai.ttf","simkai","normal");
    // console.log(doc.getFontList());
    doc.setFont("simkai");
    doc.setFontSize(12);

    splitTitle = doc.splitTextToSize(editInput.val(), 530);
    doc.text(30, 40, splitTitle);

    doc.save("test.pdf");


    // 写入txt
    window.ipcRenderer.send("writeFile", editInput.val());

    splitTitle = "";
}