/**
 * Created by gaozy on 10/18/16.
 */
function onCodeClick() {
    var code = editor.getValue(); //$("#code").val();
    $.post( "/", { code: code, action: "code"}, function(result){
        window.alert(result);
        $("h6").text(result);
    });
}

function onRecordClick() {
    var record = $("#record").val();
    $.post( "/", { record: record, action:"record"}, function(result){
        window.alert(result);
        $("h6").text(result);
    });
}

function onMXClick() {
    var mx = $("#mx").val();
    window.alert("ready to update mx:"+mx);
    $.post("/", { mx: mx, action:"mx"}, function(result){
       window.alert(result);
        $("h6").text(result);
    });
}

function onNSClick() {
    var ns = $("#ns").val();
    window.alert("ready to update ns:"+ns);
    $.post("/", { ns: ns, action:"ns"}, function(result){
        window.alert(result);
        $("h6").text(result);
    });
}

function onCNAMEClick() {
    var cname = $("#cname").val();
    $.post("/", {cname: cname, action:"cname"}, function(result){
        window.alert(result);
        $("h6").text(result);
    });
}

function onFiledClick() {
    // FIXME: this needs to update based on the UI desgin
    var field = $("#field").val();
    $.post("/", {field:field, action:"field"}, function(result){
       window.alert(result);
        $("h6").text(result);
    });
}

function onTestClick() {
    var code = editor.getValue(); //$("#code").val();
    var accessor = $("#accessor").val();
    var value = $("#value").val();
    var qvalue = $("#qvalue").val();
    if(value.localeCompare("")==0)
        value = "{}";
    if(qvalue.localeCompare("")==0)
        qvalue = "{}";
    if(code.localeCompare("")==0){
        window.alert("Please enter your code!");
        return;
    }

    $.post("/test", {code: code, value: value, qvalue: qvalue, accessor: accessor},
       function(data){
            alert(data);
            var json = JSON.parse(data);
            var value = json["value"];
            var qvalue = json["qvalue"];
            var err = json["err"];
            $("#value").val(value);
            $("#qvalue").val(qvalue);
            $("#err").val(err);
       }
    );
}


function onChange(){
    var chosen = $("#codeExamples").val();
    switch(chosen){
        case "noop":
            editor.setValue(noop_code);
            break;
        case "random":
            editor.setValue(random_code);
            break;
        case "latency":
            editor.setValue(latency_code);
            break;
        default:
            break;
    }
}