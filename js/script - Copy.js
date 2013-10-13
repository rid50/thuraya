var status_enum = {
	submit: "submit",
	approve: "approve",
	reject: "reject",
	complete: "complete",
	readonly: "readonly",
	all: "all"
};

var actor_enum = {
	manager: 0x1,
	employee: 0x2
};

var idp;
var documentSource;
var lang;

var userInfo;

var rootDoc;
var rootActors;
var rootAreas;
var superuser;
var actor;
var actorSectionNumber;
var reportTo = null;
var asyncSuccess;
var areaNames;
//var filter;
var searchInterval;

//first, checks if it isn't implemented yet
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

$.xml = function(el) {
	if (window.XMLSerializer)
		 return (new XMLSerializer()).serializeToString(el);
	else if (window.ActiveXObject)
		 return this.xml;
    else alert('Xmlserializer not supported');
}

function xml2Str(xmlNode) {
	try {
		// Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
		return (new XMLSerializer()).serializeToString(xmlNode);
	}
	catch (e) {
		try {
			// Internet Explorer.
			return xmlNode.xml;
		}
		catch (e) {  
			//Other browsers without XML Serializer
			alert('Xmlserializer not supported');
		}
	}
	return false;
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

$(document).ready(function () {
/*
 var language = navigator.userLanguage || navigator.language;
    if( jQuery.inArray( language, ['ar', 'he', 'ur'] ) != -1 )
        jQuery( 'input[type="text"], input[type="password"], textarea' ).css( 'direction', 
		
	$("*").filter( function() {
		return /^(left|right)$/.test( $(this).css("float") )
	})
	var l = $('*').filter(function() {
		return $(this).css('float') == 'left';
	});
	
	$('input').addClass("ui-corner-all");
	$('button').button();
	
		
*/
	//$('body').css('direction','rtl');
/*
	var j = $.toJSON({
		banana: "yellow",
		strawberry: "red",
		group: {
			red: "strawberry",
			blue: [ "berry", "other", "[]" ]
		}
	});
*/	
	$.ajaxSetup({ cache: false, async: false });
/*
// Setup the ajax indicator
	$('body').append('<div id="ajaxBusy"><p><img src="images/ajax-loader.gif"/></p></div>');
	$('#ajaxBusy').css({
		//position: "fixed",
		//top: "45%",
		//left: "48%",
		//"margin-top": "-10px",
		//"margin-left": "-110px",
		//"z-index": "100",
		display:"none",
		position:"absolute",
		left:"5px",
		top:"5px"
	});
*/
	$.blockUI.defaults.message = '<img src="images/ajax-loader.gif"/>';
	$.blockUI.defaults.css.top = '3px';
	$.blockUI.defaults.css.left = '3px';
	$.blockUI.defaults.css.textAlign = 'left';
	$.blockUI.defaults.css.border = 'none';
	$.blockUI.defaults.css.color = 'transparent';
	$.blockUI.defaults.css.backgroundColor = 'transparent';
	$.blockUI.defaults.css.cursor = 'default';
	
	$.blockUI.defaults.overlayCSS.backgroundColor = '#383838';
	$.blockUI.defaults.overlayCSS.opacity = 0.2;
	//$.blockUI.defaults.overlayCSS.cursor = 'wait';
	
	if (navigator.userAgent.match(/msie/i))
		$.blockUI.defaults.overlayCSS.cursor = 'default';

	$.blockUI.defaults.centerX = true;
	$.blockUI.defaults.centerY = true;
/*
	$.blockUI({onUnblock : function(){
			$("body").css({
				"cursor" : "default"
			})
		}
	});
*/	
	// Ajax activity indicator bound to ajax start/stop document events
	$(document)
		.ajaxStart(function(){
			//$.blockUI({ message: null }); 
			//$.blockUI.defaults.overlayCSS.cursor = 'wait';
			$.blockUI();
			//$('#ajaxBusy').show(); 
		})
		.ajaxStop(function(){
			//$.blockUI.defaults.overlayCSS.cursor = 'default';
			$.unblockUI();
			//$('body').css('cursor', 'auto');
			//$.unblockUI({cursorReset: 'default'});
			//$('#ajaxBusy').hide();
		});

	$.get("get_ini.php")
		.done(function(data) {
			idp = data.IdP;
			documentSource = data.documentSource;
			lang = data.lang;
			searchInterval = data.searchInterval;
		});

		
	//if ($("html[lang='ar']").length)
	if (lang == "ar")
		toggleLanguage('ar', 'rtl');
	else {
		jQuery.i18n.properties({
			name:'Messages', 
			path:'bundle/', 
			mode:'both',
			language: 'en'
		});	
	}
	
	$(function() {
		$("#accordion").accordion({
			//active: false,
			collapsible: true
		});
		
		$.datepicker.setDefaults( $.datepicker.regional[ "" ] );
		$.datepicker.setDefaults({
			showOn: "both",
			buttonImageOnly: true,
			buttonImage: "images/calendar.gif",
			buttonText: "Calendar"
		});
		
		$("#datepicker").datepicker({
			changeMonth: true,
			changeYear: true,
		});

		$("#datepicker2").datepicker({
			changeMonth: true,
			changeYear: true,
			//showButtonPanel: true,
		});

		$("#datepicker").datepicker( $.datepicker.regional[ "" ] );
		$("#datepicker").datepicker( "option", "dateFormat", "dd/mm/yy" );
		//$("#datepicker").datepicker( "setDate", "25/04/2013" );
		$("#datepicker").datepicker( "setDate", "-" + searchInterval + "m" );
		$("#datepicker2").datepicker( $.datepicker.regional[ "" ] );
		$("#datepicker2").datepicker( "option", "dateFormat", "dd/mm/yy" );
		//$("#datepicker2").datepicker( "setDate", "5/5/2013" );
		$("#datepicker2").datepicker( "setDate", "now" );
		$('input[id="datepicker"], input[id="datepicker2"]').change(function() {
			var regExpPattern = /^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)\d\d$/;
			if (!$(this).val().match(regExpPattern)) {
				$(this).addClass( "ui-state-error" );
				$("#searchButton").attr('disabled', 'disabled');
			} else {
				$(this).removeClass( "ui-state-error" );
				$("#searchButton").removeAttr("disabled");
			}

			if ($("#datepicker").val().match(regExpPattern) && $("#datepicker2").val().match(regExpPattern)) {
				if ($("#datepicker2").datepicker("getDate") - $("#datepicker").datepicker("getDate") <= 0) {
					$("#datepicker, #datepicker2").addClass( "ui-state-error" );
					$("#searchButton").attr('disabled', 'disabled');
				} else {
					$("#datepicker, #datepicker2").removeClass( "ui-state-error" );
					$("#searchButton").removeAttr("disabled");
				}
			}
		});

		$("#searchButton").on("click", function(){
			getDocs();
		});

		var selectTag = $("#report_list");
		if (selectTag.children().length == 0) {
			selectTag.append('<option value="byAddress">' + $.i18n.prop("ByAddress") + '</option>');
			selectTag.append('<option value="byApprover">' + $.i18n.prop("ByApprover") + '</option>');
		}

//		if (document.getElementById("report_list").selectedIndex != -1)
		if (selectTag.val() == null)
			$("#reportPrintButton").attr('disabled', 'disabled');
		else
			$("#reportPrintButton").removeAttr("disabled");
		
		$("#report_list").change(function() {
			$("#reportPrintButton").removeAttr("disabled");
		});
		
		$("#reportPrintButton").on("click", function(){
			printReport();
		});
		
		$("#searchResetButton").on("click", function(){
			$("#file_number_search").val("");
			$("#paci_number_search").val("");
			//var selTag = $("#approver_search");
			$("#approver_search").val("0");
			//selVal = $("#approver_search option:selected").text()
			$("#datepicker").datepicker( "setDate", "-" + searchInterval + "m" );
			$("#datepicker").removeClass( "ui-state-error" );
			$("#datepicker2").datepicker( "setDate", "now" );
			$("#datepicker2").removeClass( "ui-state-error" );
			//$("#area_search").val("0");
			$("#area_search").val("");
			$("#block_search").val("");
			$("#street_search").val("");
			$("#searchButton").removeClass( "ui-state-error" );
			$("#searchButton").removeAttr("disabled");
		});
		
		
		//filter = {dateFrom: $('input[id="datepicker"]').val() , dateTo: $('input[id="datepicker2"]').val(),};
	
		//$( "#locale" ).change(function() {
		//	$( "#datepicker" ).datepicker( "option",
		//		$.datepicker.regional[ $( this ).val() ] );
		//});
	});
	
	$(function() {
		//var selectTag = $("#area_search");
		areaNames = [];
		$.get("areas.xml")    // sync request
		.done(function(data) {
			rootAreas = data;
			var a = [], name;
			$(data).find('areas>area').each(function() {
				name = $(this).text();
					
				if (a.indexOf(name) == -1)
					a.push(name);
			});

			a.sort(
				function(a, b) {
					if (a.toLowerCase() < b.toLowerCase()) return -1;
					if (a.toLowerCase() > b.toLowerCase()) return 1;
					return 0;
				}
			);

			//selectTag.append('<option value="0"> --- ' + jQuery.i18n.prop('Select') + ' --- </option>');
			a.forEach(function(name){
				areaNames.push(name);
				//selectTag.append('<option value="' + name + '">' + name + '</option>');
			});
		})
		.fail(function() {
			console.log("getAreas - error");
		});
		
		var area = $("#area");
		var selectedItem;
		//area.focus(function() {
		//	selectedItem = null;
		//});
		
		area.blur(function() {
			//if (selectedItem != null && selectedItem.length == 0) {
			if (selectedItem != undefined && selectedItem.length == 0) {
				areaNames.push(area.val());
			
				//selectedItem = null;
				var areas = $(rootAreas).find("areas");
				areas.attr("dirty", "yes");
				areas.append(createSpaceElement(1));
				areas.append(createElement("area", area.val()));
				areas.append(createNewLineElement(1));
/*				
				$.post("xml-write.php", {'fileName': 'areas.xml', 'xml' : $.xml(rootAreas)},
				function(data, status){
					if (data.error) {
						alert("Data: " + data + "\nStatus: " + status);
					}
				}, "text");
*/				
			}
		});
		
		area.autocomplete({
			source: areaNames,
			//change: function( event, ui ) {
			//},
			response: function( event, ui ) {
				selectedItem = ui.content;
			},
			//select: function( event, ui ) {
			//},
			//open: function( event, ui ) {
			//	var i = 0;
			//},
		});
		
		$("#area_search").autocomplete({
			source: areaNames,
		});
	});

	if (navigator.appName == 'Microsoft Internet Explorer')
	{
		var ver = -1; 
		var ua = navigator.userAgent;
		var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(ua) != null)
			ver = parseFloat( RegExp.$1 );
		
		if (ver < 9) {
			$(".customBody>div").hide();
			$(".customBody").addClass("rejected");
			alert ("Internet Explorer must be version 9 and above");
			return;
		} else {
			XMLDocument = Document;
		}
	}
	
	
	
	var userLoginName = "";
	//userLoginName = "abdalla";
	//userLoginName = "amr";
	//userLoginName = "ahmed";
	//userLoginName = "bader";
	//userLoginName = "basma";
	//userLoginName = "bashar";
	//userLoginName = "zjaljadi";
	//userLoginName = "tamalallah";
	//userLoginName = "ridavidenko";

	start(userLoginName, null);
	$("#accordion").show();
	
});


function start(userLoginName, func) {
	rootDoc = null;
	rootActors = null;
	userInfo = [];

	getUserIdentities("GetUserInfo", [{loginName:userLoginName}], function() {
		var found = false;
		$.get("actors.xml")    // sync request
			.success(function(data) {
				rootActors = data;
				superuser = $(data).find('department').attr('superuser').split(',');

				$(data).find('managers>manager, managers employee').each(function() {
					if (this.nodeName == "manager" && $(this).attr("name") == userInfo[0].loginName || userInfo[0].loginName == $(this).text()) {
						found = true;
						return;
					}
				});
				
				var a = [], name;
				$(data).find('employees employee').each(function() {
					name = $(this).text();
						
					if (a.indexOf(name) == -1)
						a.push(name);
				});

				var loginNames = [];
				a.forEach(function(name){
					var personInfo = {};
					personInfo.loginName = name;
					loginNames.push(personInfo);
				});
				
				getUserIdentities("GetUserInfo", loginNames, function() {
					fillUserLoginCombo();
					
					if (found) {
						$(".customBody").removeClass("rejected");
						getActorsStatus();
						initTabs();
						getDocs();
						$(".customBody>div").show();
					} else {
						$(".customBody>div").hide();
						$(".customBody").addClass("rejected");
					}
					if (func != null) {
						func();
					}
				});
			})
			.fail(function() {
				console.log("getActors - error");
			});
			
		$("#customFlagKuwait").off("click").on("click", function(event){
			if ($("body[dir='ltr']").length) {
				toggleLanguage('ar', 'rtl');
			}
		});

		$("#customFlagUK").off("click").on("click", function(event){
			if ($("body[dir='rtl']").length) {
				toggleLanguage('en', 'ltr');
			}
		});
	/*
		$(".customMiddleSide #tasks").on("mousedown", ".taskItemButtons", function(){
			$(this).animate({'top': '+=1px', 'left': '+=1px'}, 100);
		});

		$(".customMiddleSide #tasks").on("mouseup", ".taskItemButtons", function(){
			$(this).animate({'top': '-=1px', 'left': '-=1px'}, 100);
		});

		$('.customMiddleSide').scroll(function() {
			//$('.customLeftSide').append("<span>" + $(this).scrollTop() + "</span><br/>");
			//$('.customLeftSide').append("<span>" + $(this).height() + "</span><br/>");
			//scrollEvent('aeventData');
		});
	*/
	});
}
	
function getUserIdentities(url, json, func) {
	var	contentType, data;
	if (idp == "LDAP") {
		contentType = "application/x-www-form-urlencoded; charset=UTF-8";
		url = "ldap_repo.php";
		data = {"param":{loginNames:JSON.stringify(json)}};
	} else if (idp == "AD") {
		contentType = "application/json; charset=utf-8";
		url = "ASPNetWebService.asmx/" + url;
		data = "{\"loginNames\":" + JSON.stringify(json) + "}";
	} else {
		//url = "get_user_attributes.php";
		contentType = "application/x-www-form-urlencoded; charset=UTF-8";
		//data = {loginNames:JSON.stringify(json)};
		
		url = "json_db_crud_pdo.php";
		data = {"func":"getUserAttributes",
			"param":{loginNames:JSON.stringify(json)}
		};
	}
	//url = "simpleSAMLSP.php";
	//var type = "GET";
	//var	data = "loginNames=" + JSON.stringify(json);
	//var	data = "loginNames=" + "{\"loginNames\":" + JSON.stringify(json) + "}";

	var syncSuccess = false;
	$.ajax({ 
		type: "POST",
		url: url,
		//url: "ASPNetWebService.asmx/" + url,
		//url: 'simpleSAMLSP.php?loginName="roman"&password="roman"',
		//url: 'simpleSAMLSP.php',

		async: true,
		contentType: contentType,
		//contentType: "application/json; charset=utf-8",
		//contentType: "application/xml; charset=utf-8",
		//dataType: "xml",
		//dataType: "json",
		//data: { loginNames: json },
		//data: "{\"loginNames\":" + JSON.stringify(json) + "}",
		data: data,
		//data: {'loginNames':JSON.stringify(json)},
		//data: "{}",
		processData: true,
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert($.parseJSON(XMLHttpRequest.responseText).Message);

			//alert("Status: " + errorThrown);
		
			//loginName = $.parseJSON(this.data).loginName;
			//displayName = loginName;
			syncSuccess = false;
			asyncSuccess = false;
		},
		success: function(data) {
			//$('#userName').text($(data).text());	//xml response
			//$('#userName').text(data.d);			//json response
			//data.d.Data[0].Groups[1].toString();
			//data.d.Data[0].Groups.length;
			//loginName = data.d.Data[0].LoginName;
			//displayName = data.d.Data[0].DisplayName;
			if (data.constructor == Array) {
				if (data[0].error != undefined) {
					alert (data[0].error);
					return;
				}
			}

			var v, result;
			if (data.d == undefined)
				result = data;
			else
				result = data.d.Data;
			
			//data.d.Data.forEach(function(o) {
			result.forEach(function(o) {
				v = new Object();
				v.loginName = o.LoginName;
				v.displayName = o.DisplayName;
				userInfo.push(v);
			});
			syncSuccess = true;
			
			func();
		}
	});
	return syncSuccess;
}

function getDocs() {
	var url;
	if (documentSource == "XML")
		url = "docs.xml";
	else
		url = "json_db_crud_pdo.php";
	
	var selVal = "";
	var selTag = document.getElementById("approver_search");
	if (selTag.selectedIndex != -1 && selTag.selectedIndex != 0)
		selVal = selTag.options[selTag.selectedIndex].text;

	var filter = getSearchFilter();

	$.get(url, {"func":"getDocs", "param":{filter:filter, docFileNumber: ""}})
		.done(function( data ) {
			if (data.constructor == Array) {
				if (data[0].error != undefined) {
					alert (data[0].error);
					return;
				}
			}
			
			rootDoc = data;
			//$.each(data[0], function(key, val) {
			//	console.log(key + ' ' + val);
			//})

			//var v = $.parseJSON(data);
			//steps_to_approve = parseInt($(data).find('docs').attr('steps_to_approve'));
			
			if (data.constructor == XMLDocument)
				selectXmlNodes();
			else
				selectJsonNodes();

			fillApproverSearchCombo();
			
			//initTabs();
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			alert("getDocs - error: " + errorThrown);
		});
}

function getFromDate() {
	var dt = new Date();
	dt.setMonth(dt.getMonth() - searchInterval);
	var d = dt.getDate();
	var m = dt.getMonth() + 1;
	var y = dt.getFullYear();
	return (d <= 9 ? '0' + d : d) + '/' + (m <= 9 ? '0' + m : m) + '/' + y;
}

function getToDate() {
	var dt = new Date();
	var d = dt.getDate();
	var m = dt.getMonth() + 1;
	var y = dt.getFullYear();
	return (d <= 9 ? '0' + d : d) + '/' + (m <= 9 ? '0' + m : m) + '/' + y;
}

function getSearchFilter() {
	var dt, dt2;
	var regExpPattern = /^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)\d\d$/;
	if ($("#datepicker").val().match(regExpPattern) && $("#datepicker2").val().match(regExpPattern)) {
		if ($("#datepicker2").datepicker("getDate") - $("#datepicker").datepicker("getDate") <= 0) {
			dt = getFromDate();
			dt2 = getToDate();
		} else {
			dt = $("#datepicker").val();
			dt2 = $("#datepicker2").val();
		}
	} else {
		dt = getFromDate();
		dt2 = getToDate();
	}	
	
	var selVal = "", selVal2 = "";
	var selTag = $("#approver_search");
	if (selTag.val() && selTag.val() != 0)
		selVal = $("#approver_search option:selected").text()

	//selTag = $("#area_search");
	//if (selTag.val() && selTag.val() != 0)
	//	selVal2 = $("#area_search option:selected").text()
	
	var status = actorSectionNumber;
	//if (rejected != undefined)
	if ($("#tabs").hasClass("ui-tabs") && $("#tabs").tabs( "option", "active" ) == 3)
		status = -1;
		
	return {
		//actorRole:actorSectionNumber,
		fileNumber: $("#file_number_search").val(),
		paciNumber: $("#paci_number_search").val(),
		approver: selVal,
		dateFrom: dt,
		dateTo: dt2,
		//area: selVal2,
		area: $("#area_search").val(),
		block: $("#block_search").val(),
		street: $("#street_search").val(),
		status: status,
	};
}

function initTabs() {
//$(function() {
	if (!$("#tabs").hasClass("ui-tabs")) {
		$("#tabs-2").append($("#userAssignmentDiv"));
		$("#tabs-2").append($("#newForm"));

		$("#tabs>ul>li").find('a[href="#tabs-1"]').text(jQuery.i18n.prop("DocumentListTab"));
		$("#tabs>ul>li").find('a[href="#tabs-2"] span').text(jQuery.i18n.prop("UserAssignmentTab"));
		$("#tabs>ul>li").find('a[href="#tabs-3"]').text(jQuery.i18n.prop("PendingDocumentListTab"));
		$("#tabs>ul>li").find('a[href="#tabs-4"]').text(jQuery.i18n.prop("RejectedDocumentListTab"));
		$("#tabs").tabs({
			beforeActivate: function( event, ui ) {
				$("#addUserError").detach();
				if ( actor == actor_enum.employee && $("#tabs").tabs( "option", "active" ) == 0) {
					if ($("#newForm").css("display") == "none") {
						//$("#tabs-2").append($("#newForm"));
						$("#newForm").show();
					}
					resetForm();
				} else
				if ( actor == actor_enum.manager && $("#tabs").tabs( "option", "active" ) == 0 && $("#userAssignmentDiv").css("display") == "none") {
				//if ( actor == actor_enum.manager && $( "#tabs" ).tabs( "option", "active" ) == 0 && $("#userList").css("display") == "none") {
					//$("#tabs-2").append($("#userAssignmentDiv"));

					//$("#tabs-2").append($("#custom_jsTree"));
					//$("#tabs-2").append($("#userList"));
					if (!$("#custom_jsTree").hasClass("jstree"))
						userAssignment();
					else {
						$("#userAssignmentDiv").show();
						//$("#custom_jsTree").show();
						//$("#userList").show();
					}
				}
			},

			activate: function( event, ui ) {
				if (actor == actor_enum.manager && actorSectionNumber == 0) {
					if (ui.newTab.index() == 3)
						getDocs();   // get rejected docs
				}
			}
		});

	}

	$("#tabs").tabs( "enable", 0 );
	$("#tabs").tabs( "option", "active", 0 );
	
	if (actor == -1) {
		$("#tabs").tabs( "disable", 0 );
		$("#tabs").tabs( "disable", 1 );
	} else if (actor == actor_enum.employee && actorSectionNumber > 0) {
		$("#tabs").tabs( "disable", 1 );
	} else
		$("#tabs").tabs( "enable", 1 );

	if (actor == actor_enum.manager && actorSectionNumber == 0) {
		$("#tabs").tabs( "enable", 2 );
		$("#tabs>ul>li").find('a[href="#tabs-3"]').parent().show();
		$("#tabs").tabs( "enable", 3 );
		$("#tabs>ul>li").find('a[href="#tabs-4"]').parent().show();
	} else {
		$("#tabs").tabs( "disable", 2 );
		$("#tabs>ul>li").find('a[href="#tabs-3"]').parent().hide();
		$("#tabs").tabs( "disable", 3 );
		$("#tabs>ul>li").find('a[href="#tabs-4"]').parent().hide();
	}

	//$("#tabs>ul>li").find('a[href="#tabs-3"]').parent().hide();

	// fix the classes
	$( ".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *" )
		.removeClass( "ui-corner-all ui-corner-top" )
		.addClass( "ui-corner-bottom" );
	// move the nav to the bottom
	$( ".tabs-bottom .ui-tabs-nav" ).appendTo( ".tabs-bottom" );
	$( "#tabs" ).show();
//});
}


function getActorsStatus() {
	var v;
	actor = -1, actorSectionNumber = -1;
	if ((v = $(rootActors).find('manager[name="' + userInfo[0].loginName + '"]')).length != 0) {
		$("#tabs>ul>li").find('a[href="#tabs-2"] span').text(jQuery.i18n.prop("UserAssignmentTab"));
		actorSectionNumber = v.closest('section').index();		//a position of an actor's section to determine what records to show to approve
		actor = actor_enum.manager;
		reportTo = v.closest('section').next().find('manager');		//reportTo[0].attributes[0].value
		//reportTo = v.closest('section').next().find('manager').attr('name');
	} else {
		$(rootActors).find('manager>employee').each(function(){
			$("#tabs>ul>li").find('a[href="#tabs-2"] span').text(jQuery.i18n.prop("CreateNewDocumentTab"));
			if ($(this).text() == userInfo[0].loginName) {
				//actorSectionNumber = v.index();			//a position of an actor's section to determine what records to show to edit
				actor = actor_enum.employee;
				//v = $(this).closest('manager').attr('name');
				//actorSectionNumber = $(data).find('manager[name="' + v + '"]').index(); 	//a position of an actor's section to determine what records to show
				actorSectionNumber = $(this).closest('section').index(); 				//a position of an actor's section to determine what records to show
																							// or to edit if this is a first section
				return false;
			}
		})
	}
}

function fillApproverSearchCombo() {
	var selectTag = $("#approver_search");
	if (selectTag.children().length != 0)
		return;

	var a = [], i = 0;
	if (rootDoc.constructor == XMLDocument) {
		$(rootDoc).find("docHistory").each(function(index){
			$(this).find("docApprover:gt(0)").each(function(index){
				if (a.indexOf($(this).text()) == -1)
					a.push($(this).text());
			});
		});
	} else {
		$.get("json_db_crud_pdo.php", {"func":"getApprovers", "param":""})
			.done(function( data ) {
				if (data.constructor == Array) {
					if (data[0].error != undefined) {
						alert (data[0].error);
						return;
					}
				}
				
				data.forEach(function(o) {
					a.push(o);
				});
				//initTabs();
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				alert("getApprovers - error: " + errorThrown);
			});
/*	
		rootDoc[0].docs.forEach(function(key, index) {
			if (index != 0)
				key.doc.docHistory.forEach(function(keyh) {
				if (a.indexOf(keyh.docApprover) == -1)
					a.push(keyh.docApprover);
				});
		});
*/		
	}
	
	a.sort(
		function(a, b) {
			if (a.toLowerCase() < b.toLowerCase()) return -1;
			if (a.toLowerCase() > b.toLowerCase()) return 1;
			return 0;
		}
	);

	selectTag.append('<option value="' + (i++) + '"> --- ' + jQuery.i18n.prop('Select') + ' --- </option>');
	a.forEach(function(name){
		selectTag.append('<option value="' + (i++) + '">' + name + '</option>');
	});
}

function addToUserLoginCombo() {
	$("#userLoginSelect option").remove();
	fillUserLoginCombo();
}

function fillUserLoginCombo() {
	var selectTag = $("#userLoginSelect");
	if (selectTag.children().length != 0)
		return;

	var a = [], val;
	userInfo.forEach(function(o, index) {
		if (index != 0)
			a.push(o.displayName + "|" + o.loginName);
			//a.push(o.displayName + " (" + o.loginName + ") ");
	});
	
	a.sort(
		function(a, b) {
			if (a.toLowerCase() < b.toLowerCase()) return -1;
			if (a.toLowerCase() > b.toLowerCase()) return 1;
			return 0;
		}
	);

	var html;
	var flag = true;
	a.forEach(function(name){
		name = name.split('|');
		if (flag && name[1] == userInfo[0].loginName) {
			flag = false;
			html = '<option selected="selected" value="' + name[1] + '">' + name[0] + '</option>';
		} else
			html = '<option value="' + name[1] + '">' + name[0] + '</option>';
		selectTag.append(html);
	});
	
	$(document).on("change", "#userLoginSelect", function(){
		var val = this.options[this.selectedIndex].value;
		setTimeout(function() {
			//$("#userList").detach();
			//$("#custom_jsTree").detach();
			//$("#newForm").detach();
			//$("#tabs").detach();

			$("#userAssignmentDiv").css("display", "none");
			//$("#userList").css("display", "none");
			//$("#custom_jsTree").css("display", "none");
			$("#newForm").css("display", "none");
			
			//$("body").append($("#userAssignmentDiv"));
			//$("body").append($("#userList"));
			//$("body").append($("#custom_jsTree"));
			//$("body").append($("#newForm"));
			
			start(val, function() {
				var found = false;
				superuser.some(function(name) {
					if (userInfo[0].loginName == name) {
						$("#custom_jsTree>ul>li").show();
						$("#custom_jsTree").jstree("open_all");
						found = true;
						return true;
					}
				})

				if (!found) {
					$("#custom_jsTree").jstree("close_all");
					//jQuery.jstree._reference('#custom_jsTree').close_all($("#custom_jsTree"));
					var tree_size = $("#custom_jsTree>ul>li").length;
					for (var i = 0; i < tree_size; i++) {
						if (i == actorSectionNumber) {
							$('#custom_jsTree').jstree("open_node", $("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")"));
							$("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")").show();
						} else
							$("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")").hide();
					}
				}
			});
		}, 10);
		
/*		
		$( "#tabs" ).tabs( "option", "active", 0 );
		if ( actor == actor_enum.manager && $("#userList").css("display") == "block") {
			$("#userList").css("display", "none");
			$("#custom_jsTree").css("display", "none");
			$("body").append($("#userList"));
			$("body").append($("#custom_jsTree"));

			//$("#userList").detach();
			//$("#custom_jsTree").detach();
		} else
		if ( actor == actor_enum.employee && $("#newForm").css("display") == "block") {
			$("#newForm").css("display", "none");
			$("body").append($("#newForm"));
			//$("#newForm").detach();
		}
		
		userInfo[0].loginName = this.options[this.selectedIndex].value;
		userInfo[0].displayName = this.options[this.selectedIndex].text;
		getActorsStatus();
		

		$("#tabs").tabs( "enable", 0 );
		if (actor == -1) {
			$("#tabs").tabs( "disable", 0 );
			$("#tabs").tabs( "disable", 1 );
		} else if (actor == actor_enum.employee && actorSectionNumber > 0)
			$("#tabs").tabs( "disable", 1 );
		else
			$("#tabs").tabs( "enable", 1 );
		
		selectXmlNodes();
*/		
	});
}

//function selectXmlNodes(category) {
function selectXmlNodes() {
	$("#docs").empty();
	var i = 0;
	$(rootDoc).find('doc').each(function(){
		//var name = $(this).find('taskNumber').text();
		var dates = [];
		var names = [];
		var that = $(this);

		var history = that.find('docHistory');
		i = history.children().length;  			// the value is always a multiple of 2
		if ((actorSectionNumber + 1) * 2 != i) 
			return true;	//java's "continue" operation for javascript's "each" command
/*
		switch (category) {
			case status_enum.approve:
				if (i > 2 && i < steps_to_approve * 2)
					break;
				return true;
			case status_enum.reject:
				if (i < 3)
					break;
				return true;
			case status_enum.complete:
				if (i == steps_to_approve * 2)
					break;
				return true;
			default:
		}
*/		
//		i = 0;
		
		//var j = 0, val;
		var j = 0;
		$(history).find('docDate').each(function(){
			dates[j] = $(this).text();
			//var n = $(history).find('taskApprover')[j];
			//val = $($(history).find('docApprover')[j]).text();
		
			//userInfo.some(function(o) {
			//	if (o.loginName == val) {
			//		val = o.displayName;
			//		return true;
			//	}
			//	return false;
			//});
			
			//names[j] = val;
			names[j] = $($(history).find('docApprover')[j]).text();
			j++;
		});
		
		addDocToList($('.customMiddleSide #docs'), i++,
					that.find('docFileNumber').text(),
					dates,
					names,
					that.find('docArea').text(),
					that.find('docBlock').text(),
					that.find('docStreet').text(),
					that.find('docBuilding').text(),
					that.find('docPACINumber').text()
					//$(this).find('taskDescription').text(),
					//$(this).find('taskStatus').text()
					);
		//alert(name);
	});					
}	


function selectJsonNodes() {
	var docListSelector = $("#docs");
	
	//var rejected = false;
	if ($("#tabs").hasClass("ui-tabs") && $("#tabs").tabs( "option", "active" ) == 3) {
	//if (rejected != undefined)
		//rejected = true;
		docListSelector = $("#rejectedDocs");
	}

	docListSelector.empty();

	//$(".customMiddleSide #docs").empty();
	
	if (rootDoc[0].docs == undefined)
		return;
		
	var i = 0;
	rootDoc[0].docs.forEach(function(key) {
	//$(rootDoc).find('doc').each(function(){
		//var name = $(this).find('taskNumber').text();
		//var that = $(this);
		//var history = that.find('docHistory');
		
		var dates = [];
		var names = [];
		if (key.doc != undefined) {
			//i = key.doc.docHistory.length;  			// the value is always a multiple of 2 
			//if ((actorSectionNumber + 1) * 2 != i * 2) 
			//	return true;	//java's "continue" operation for javascript's "each" command

			var j = 0;
			key.doc.docHistory.forEach(function(keyh) {
				//dates[j] = $(this).text();
				dates[j] = keyh.docDate;
				//names[j] = $($(history).find('docApprover')[j]).text();
				names[j] = keyh.docApprover;
				j++;
			});
			
			//addDocToList($('.customMiddleSide #docs'), i++,
			addDocToList(docListSelector, i++,
						key.doc.docFileNumber,
						dates,
						names,
						key.doc.docArea,
						key.doc.docBlock,
						key.doc.docStreet,
						key.doc.docBuilding,
						key.doc.docPACINumber
						//$(this).find('taskDescription').text(),
						//$(this).find('taskStatus').text()
						);
		}
		//alert(name);
	});					
}	

//$('.customMiddleSide>ul').empty();

function addDocToList(list, id, file_number, date, name, area, block, street, building, paci_number, title) {
	// Create a copy of the <li> template
	var itemTemplate = $('#TemplateListItems').clone();

	// Remove the unnecessary id attribute
	itemTemplate.attr('id', null);

	itemTemplate.find('.docFileNumber span').text(file_number);
	
	var selectTag = itemTemplate.find('.docDetailDiv select');

	var i = 0;
	$(date).each(function(){
		//$('<option></option>').attr('value', i + 1).html($(date)[i]).appendTo(selectTag);
		//$('<option/>', {'value': i + 1, 'selected':'selected'}).html($(date)[i++]).appendTo(selectTag);
		
		//var nam = ((i == 0) ? 'Submitted ' : 'Approved &nbsp;') + $(date)[i] + ' by ' + $(name)[i];
		var nam = $(date)[i] + ' ' + $(name)[i];
		var html;
/*
		if (i + 1 == $(date).length)
			html = "<option selected='selected' value=" + (i + 1) + '>' + nam + '</option>';
		else
			html = '<option value=' + (i + 1) + '>' + nam + '</option>';
*/

		html = ('<option {0} disabled="disabled" value="' + i + '">' + nam + '</option>').format((i + 1 == $(date).length) ? 'selected="selected"' : '');
			
		selectTag.append(html);
		i++;
	});

	var address = area + "; " + 
					$.i18n.prop('Block') + ": " + block + "; " + 
					$.i18n.prop('Street') + ": " + street + "; " + 
					$.i18n.prop('Building') + ": " + building;

	itemTemplate.find('.docAddress span').text(address);
	//itemTemplate.find('.docAddress').text(address);

	itemTemplate.find('.docPACINumber span').text(paci_number);
	
	// Set the description to the task description
	//itemTemplate.find('.taskDescription span').html(description);

	checkStatus(itemTemplate, selectTag.children().length);

	itemTemplate.data('status', status);
	itemTemplate.data('docID', id);

	// Add Doc Element created from template
	list.append(itemTemplate);
}

function checkStatus(itemTemplate, li_count) {

	//var button_images = $(itemTemplate).find("a img");
	//var button_images = $(itemTemplate).find("a");

	itemTemplate.removeClass();
	//$($(button_images)[0]).css("display", "none");	//reject button
	//$($(button_images)[1]).css("display", "none");		//approve button
	//$($(button_images)[2]).css("display", "none");		//edit button


	if (actor == actor_enum.employee && actorSectionNumber == 0) {
		itemTemplate.find("a:nth-of-type(3)").addClass("editButton");			//edit button
		itemTemplate.find("a:nth-of-type(1)").addClass("rejectButton");			//reject button
	} else {
		if (actor == actor_enum.manager) {
			if (actorSectionNumber == 3) {
				var a_tag;
				if ($("body[dir='ltr']").length) {
					a_tag = $('<a href="#" class="docPrintAnchor floatRight">' + jQuery.i18n.prop('Print') + '</a>');
					a2_tag = $('<a href="#" class="docCommentAnchor floatRight">' + jQuery.i18n.prop('Comment') + '</a>');
				} else {
					a_tag = $('<a href="#" class="docPrintAnchor floatLeft">' + jQuery.i18n.prop('Print') + '</a>');
					a2_tag = $('<a href="#" class="docCommentAnchor floatLeft">' + jQuery.i18n.prop('Comment') + '</a>');
				}
				
				itemTemplate.find(".docDetailDiv").prepend(a2_tag);
				itemTemplate.find(".docDetailDiv").prepend(a_tag);
			} else {
				itemTemplate.find("a:nth-of-type(2)").addClass("approveButton");			//approve button
				if (actorSectionNumber == 2)
					itemTemplate.find("a:nth-of-type(1)").addClass("rejectButton");			//reject button
			}
		}
	}
}

$(document).on("click", ".approveButton", function(){
	commentDialog(this, "approve");
});

$(document).on("click", ".rejectButton", function(e, data){
	if (actor == actor_enum.employee && actorSectionNumber == 0) {

		e.stopImmediatePropagation();
	
		if (!confirm("Are you sure?")) {
			//e.stopImmediatePropagation();
			return false;
		}

		var fileNumber = $(this).parent().find(".docFileNumber span").text();
		//$(this).parent().remove();
		deleteDocument(fileNumber);
	} else 
		commentDialog(this, "reject");
});

function deleteDocument(fileNumber) {
	var url, data;
	if (documentSource == "XML") {
		return;
		//url = "xml-crud.php";
		//data = {'fileName': 'docs.xml', 'xml' : $.xml(rootDoc)};
		//dataType = "text";
	} else {
		url = "json_db_crud_pdo.php";
		data = {"func":"delete",
			"param":{
				docFileNumber: fileNumber,
			}};
		//dataType = "json";
	}

	$.post(url, data)
		.done(function(data){
			if (data && data.constructor == Array) {
				if (data[0].error != undefined) {
					alert(data[0].error);
				}
			} else {
				var keyToDelete = null;
				rootDoc[0].docs.some(function(key, index) {
					if (key.doc.docFileNumber == fileNumber) {
						rootDoc[0].docs[index] = null;
						delete rootDoc[0].docs[index];
						rootDoc[0].docs.splice(index, 1);
						//keyToDelete = key;
						//key = null;
						//delete key;
						//key.doc = null;
						//delete key.doc;
						return true;
					}
				});
				
				//if (keyToDelete != null) {
				//	keyToDelete = null;
				//	delete keyToDelete;
				//}
				
				selectJsonNodes();
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			alert("deleteDoc - error: " + errorThrown);
		});
}

this.commentDialog = function(that, action) {
    //$("#commentDialog").dialog( "destroy" );
    //html = "<div id='cmtDialog'>";
    //html += "Comment<textarea id='comment'></textarea></div>";
	var fn = $(that).closest("div").find(".docFileNumber span").text();
//	var docFileNumber = $(rootDoc).find("doc>docFileNumber:contains('" + fn + "')");

	var docFileNumber, comment = "";
	if (rootDoc.constructor == XMLDocument) {
		docFileNumber = $(rootDoc).find("doc>docFileNumber:contains('" + fn + "')");
		comment = docFileNumber.siblings('docComment').text();
	} else {
		rootDoc[0].docs.some(function(key, index) {
			if (key.doc.docFileNumber == fn) {
				//docFileNumber = key.doc.docFileNumber;
				docFileNumber = key.doc;
				comment = key.doc.docComment == null ? '' : key.doc.docComment;
				return true;
			}
		});
	}

	//var html = '<div style="overflow:auto; height: 340px; word-wrap:break-word;">' + docFileNumber.siblings('docComment').text() + "</div><br/>";
	var html = '<div style="overflow:auto; height: 340px; word-wrap:break-word;">' + comment + "</div><br/>";
	if (action != status_enum.readonly)
		html += '<textarea name="comment" id="comment" style="width:500px;" rows="4" class="text ui-widget-content ui-corner-all" ></textarea>';
	var form = $("#dialog-form-comments");
    form.html(html);
    form.prop('currentConext', that);
    form.prop('docFileNumber', docFileNumber);	// docFileNumber ==  current doc for DB source
    form.dialog({
        title:jQuery.i18n.prop('Comment'),
		dialogClass: "no-close",
        height: 600,
        width: 600,
        modal: true,
		autoOpen: true,
/*		
        buttons: { 
			Ok: function() {
				if (action != status_enum.readonly) {
					if (action == status_enum.approve)
						approve(this.currentConext, this.docFileNumber);		// docFileNumber ==  current doc for DB source
					else if (action == status_enum.reject)
						reject(this.currentConext, this.docFileNumber);			// docFileNumber ==  current doc for DB source
				} else
					$(this).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			},
			Close: function() {
				$( this ).dialog( "close" );
			}
		},
*/		
		open: function( event, ui ) {
			//this.firstChild.scrollTop = this.firstChild.scrollHeight;
			if (action == status_enum.readonly) {
				$("#dialog-form-comments" ).dialog( "option", "buttons",
					[{	text: "Close",
						click: function() {
							$( this ).dialog( "close" )
						}
					}]
				); 
			} else {
				$("#dialog-form-comments" ).dialog( "option", "buttons",
					[{	text: "Ok",
						click: function() {
							if (action == status_enum.approve)
								approve(this.currentConext, this.docFileNumber);		// docFileNumber ==  current doc for DB source
							else if (action == status_enum.reject)
								reject(this.currentConext, this.docFileNumber);			// docFileNumber ==  current doc for DB source
						}
					},
					{	text: "Cancel",
						click: function() {
							$( this ).dialog( "close" )
						}
					}]
				);
			}
				
			//ui-dialog-buttonset
			$(this).parent().find(".ui-button-text").each(function() {
				var that = $(this);
				if (that.text() == "Ok")
					that.text(jQuery.i18n.prop('Ok'));
				else if (that.text() == "Cancel")
					that.text(jQuery.i18n.prop('Cancel'));
				else if (that.text() == "Close")
					that.text(jQuery.i18n.prop('Close'));
			});
		}
    });
};

function approve(that, docFileNumber) {
	approve_reject(that, docFileNumber, true)
}

function reject(that, docFileNumber) {
	approve_reject(that, docFileNumber, false)
}

function approve_reject(that, docFileNumber, approve) {
	var comment;
	var obj = $("#dialog-form-comments");
	if (obj && obj.dialog( "isOpen" )) {
		comment = obj.find('#comment').val();
		obj.dialog('close');
	//	alert(comment);
	}

	//return;


	//var selectTag = $(that).siblings('select');
	
	//var signature;
	var dt = getDate();
	//var signature = 'Approved \&nbsp;' + dt + ' by ' + userInfo[0].displayName;
	var signature = dt + ' ' + userInfo[0].displayName;
	if (approve)
		signature = 'Approved \&nbsp;' + dt + ' ' + userInfo[0].displayName;
	else
		signature = 'Rejected \&nbsp;' + dt + ' ' + userInfo[0].displayName;

	//var html = '<option selected="selected" value="' + selectTag.children().length + '">' + signature + '</option>';
	//selectTag.append(html);
	
	//return;
	
	//var taskNumber = $(that).closest("div").find(".taskNumber span").text();
	//var taskNumber = $(this).closest("div").find(".taskNumber span").text();
	//var v = $(root).find("task>taskNumber:contains('" + taskNumber + "')").next().find("taskApprover").last();
	//var xmlNode = $(root).find("task>taskNumber:contains('" + taskNumber + "')");
	//$(root).find("task>taskNumber").each(function(){
		//if ($(this).text() == taskNumber) {
	//if (xmlNode.text() != "") {


	//var v = $(this).parent().find("taskHistory");
	//var v = $(this).next("taskHistory");

	
	var v;
	if (rootDoc.constructor == XMLDocument) {
		v = docFileNumber.next("docHistory");
		v.append(createSpaceElement(4));
		v.append(createElement("docDate", dt));
		v.append(createNewLineElement(12));
		v.append(createElement("docApprover", userInfo[0].displayName));
		v.append(createNewLineElement(8));

		html = docFileNumber.siblings('docComment').text();
		if (approve)
			html += '<span class="ca">';
		else
			html += '<span class="cr">';

		html += signature + "</span><br/>" + comment + "<br/>";
			
		//html += '<span class="ca">' + signature + "</span><br/>" + comment + "<br/>";
		var el = createElement("docComment", html);
		docFileNumber.siblings('docComment').replaceWith(el);
	} else {
		v = docFileNumber;			// docFileNumber == current doc for DB source
		var o = {"docDate": dt, "docApprover": userInfo[0].displayName};
		v.docHistory.push(o);

		html = v.docComment == null ? '' : v.docComment;
		
		if (approve)
			html += '<span class="ca">';
		else
			html += '<span class="cr">';

		html += signature + "</span><br/>" + comment + "<br/>";

		//html += '<span class="ca">' + signature + "</span><br/>" + comment + "<br/>";
		v.docComment = html;
	}
	
	//var el2 = document.createElementNS("", "taskDate");
	//var content = document.createTextNode(dt);			
	//el2.appendChild(content);
	//v.append(el);
	//var el;
	//var el = createElement("docDate", dt);
/*
	v.append(createSpaceElement(4));
	v.append(createElement("docDate", dt));
	v.append(createNewLineElement(12));
	v.append(createElement("docApprover", userInfo[0].displayName));
	v.append(createNewLineElement(8));
*/	
	//el = document.createElementNS("", "taskComment");
	//content = document.createTextNode(comment);			
	//el.appendChild(content);
/*
	signature = 'Approved \&nbsp;' + dt + ' ' + userInfo[0].displayName;
	html = docFileNumber.siblings('docComment').text();
	html += '<span class="ca">' + signature + "</span><br/>" + comment + "<br/>";
	var el = createElement("docComment", html);
	docFileNumber.siblings('docComment').replaceWith(el);
*/	

	var status = actorSectionNumber + 1;
	if (!approve)
		status = -1;

	var url, data;
	if (documentSource == "XML") {
		url = "xml-write.php";
		data = {'fileName': 'docs.xml', 'xml' : $.xml(rootDoc)};
		//dataType = "text";
	} else {
		url = "json_db_crud_pdo.php";
		data = {"func":"approve_reject",
			"param":{
				docFileNumber: v.docFileNumber,
				docHistory: {"docDate": dt, "docApprover": userInfo[0].displayName},
				docComment: v.docComment,
				status: status,
			}};
		//dataType = "json";
	}

	$.post(url, data)
		.done(function(data){
			//if (data.error) {
			//	alert("Data: " + data + "\nStatus: " + status);
			//}
			if (data && data.constructor == Array) {
				if (data[0].error != undefined) {
					if (data[0].error == "1003")
						alert(($.i18n.prop("ApprovedCannotBeModified")).format(file_number.val()));
					else
						alert(data[0].error);
				}
			} else {
				rootDoc[0].docs.some(function(key, index) {
					if (key.doc.docFileNumber == docFileNumber) {
						rootDoc[0].docs[index] = null;
						delete rootDoc[0].docs[index];
						rootDoc[0].docs.splice(index, 1);
						return true;
					}
				});

				selectJsonNodes();
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			alert("approveDoc - error: " + errorThrown);
		});
/*
	$.post("xml-crud.php", {'fileName': 'docs.xml', 'xml' : $.xml(rootDoc)},
		function(data, status){
			if (data.error)
				alert("Data: " + data + "\nStatus: " + status);
			else
				selectXmlNodes();
		}, "text"
	);
*/	
}	

/*
//$(document).on("click", ".taskItemRejectButton", function(){
function reject(that, docFileNumber) {
	var comment;
	var obj = $("#dialog-form-comments");
	if (obj && obj.dialog( "isOpen" )) {
		comment = obj.find('#comment').val();
		obj.dialog('close');
	//	alert(comment);
	}
//return;

	//var selectTag = $(this).parent().siblings('select');
	//var selectTag = $(this).siblings('select');
	var selectTag = $(that).siblings('select');

	if (selectTag.children().length == 1)
		return;
		
	selectTag.find("option").last().prev().prop('selected', true);
	selectTag.find("option").last().remove();
	//selectTag.find("option").last().prop('selected', true);
	//return;
	
	//var taskNumber = $(that).closest("div").find(".taskNumber span").text();
	//var v = $(root).find("task>taskNumber:contains('92066')").next().find("taskApprover").last();
	//var xmlNode = $(root).find("task>taskNumber:contains('" + taskNumber + "')");
	//$(root).find("task>taskNumber").each(function(){
		//if ($(this).text() == taskNumber) {
	//if (xmlNode.text() != "") {
	
	//$(root).find("task>taskNumber").each(function(){
		//if ($(this).text() == taskNumber) {
			//var v = $(this).parent().find("taskHistory");
		//var v = xmlNode.next("taskHistory");
		var v = docFileNumber.next("docHistory");
		v.find("docApprover").last().remove();
		v.find("docDate").last().remove();
		//docFileNumber.next("docHistory").replaceWith(v);

			//$("<taskDate>" + dt + "</taskDate>").appendTo(v);
			//$("<taskApprover>" + nam + "</taskApprover>").appendTo(v);
			//v.append($("<taskDate>" + dt + "</taskDate>"));
			//v.append($("<taskApprover>" + nam + "</taskApprover>"));
			//return;
		//}
	//});
	
	
		var signature = 'Rejected \&nbsp;' + getDate() + ' ' + userInfo[0].displayName;
		//var html = xmlNode.siblings('taskComment').text();
		var html = docFileNumber.siblings('docComment').text();
		html += '<span class="cr">' + signature + "</span><br/>" + comment + "<br/>";
		var el = createElement("docComment", html);
	
		//var el = createElement("taskComment", comment);
		//$(this).siblings('taskComment').replaceWith(el);
		docFileNumber.siblings('docComment').replaceWith(el);

		//var itemTemplate = $(this).closest("div").closest("li");
		//checkStatus(itemTemplate, selectTag.children().length);
		
		//return;
		
		$.post("xml-write.php", {'fileName': 'docs.xml', 'xml' : $.xml(rootDoc)},
		function(data, status){
			if (data.error)
				alert("Data: " + data + "\nStatus: " + status);
			else
				selectXmlNodes();
		}, "text");
	//}
}	
*/
function createElement(name, value) {
	var el = document.createElementNS("", name);
	//return el2;
	//return el2.appendChild(document.createTextNode(value));
	var textNode = document.createTextNode(value);
	el.appendChild(textNode);
	return el;
	//return el;
}


function createElementWithAttribute(name, attrName, attrValue) {
	var el = document.createElementNS("", name);
	el.setAttribute(attrName, attrValue);
	return el;
}

function appendNewLineElement(el, whitespace) {
	var text = '\n';
	if (el == undefined)
		whitespace = 0;
	while (whitespace) {
		text += ' ';
		whitespace--;
	}
	var textNode = document.createTextNode(text);
	if (el == undefined)
		return textNode;
	el.appendChild(textNode);
	return el;
}

function appendSpaceElement(el, whitespace) {
	var text = '';
	if (el == undefined)
		whitespace = 0;
	while (whitespace) {
		text += ' ';
		whitespace--;
	}
	var textNode = document.createTextNode(text);
	if (el == undefined)
		return textNode;
	el.appendChild(textNode);
	return el;
}

function createNewLineElement(whitespace) {
	var text = '\n';
	while (whitespace) {
		text += ' ';
		whitespace--;
	}
	var textNode = document.createTextNode(text);
	return textNode;
}

function createSpaceElement(whitespace) {
	var text = '';
	while (whitespace) {
		text += ' ';
		whitespace--;
	}
	var textNode = document.createTextNode(text);
	return textNode;
}

function getDate() {
	var d = new Date();
	var month = d.getMonth() + 1;
	month = (('' + month).length < 2 ? '0' : '') + month;
	return d.getDate() + "/" + month + "/" + d.getFullYear();
	//return action + ' \&nbsp;' + dt + ' by ' + displayName;
}

function resetForm() {
	var file_number = $( "#file_number" ),
		area = $( "#area" ),
		block = $( "#block" ),
		street = $( "#street" ),
		building = $( "#building" ),
		paci_number = $( "#paci_number" ),
		title = $( "#title" ),
		allFields = $( [] ).add(file_number).add(area).add(block).add(street).add(building).add(paci_number).add(title),
		tips = $( "#validateTips" );

	if ($("#newForm").length != 0) {
		$("#newForm form")[0].reset();
		$("#newForm #file_number").removeAttr("readonly");
		$('#validateTips').html(jQuery.i18n.prop('ValidateTips'));
		allFields.removeClass( "ui-state-error" );
	}
	//$(form.children("form").get())[0].reset();
	//form.reset();
	//form.find("#file_number").removeAttr("readonly");
}

//function scrollEvent(eventData) {
//	var i;
//	i = 0;
//}


$(function() {
	$("button")
		.button()
		.click(function( event ) {
			event.preventDefault();
		}
	);
	
	$(document).on("click", "#addUserButton", function(){
		$("#addUserError").detach();

		var obj = $("#userList>input");
		if (obj.val().length == 0)
			return;

		var exit = false;
		userInfo.forEach(function(o) {
			if (obj.val() == o.loginName) {
		//html = ('<option {0} disabled="disabled" value="' + i + '">' + nam + '</option>').format((i + 1 == $(date).length) ? 'selected="selected"' : '');
			
				//$(".customMiddleSide").append('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">The user ' + obj.val() + ' already exists</div>');
				//$(".customMiddleSide").append(('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">The user {0} already exists</div>').format(obj.val()));
				$(".customMiddleSide").append('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">' + (jQuery.i18n.prop("UserExists")).format(obj.val()) + '</div>');
				
				obj.val("");
				exit = true;
				return false;
			}
		});
		
		if (exit)
			return;
		
		getUserIdentities("GetUserInfo",  [{loginName: obj.val()}], function () {
			var index = userInfo.length;
			if (userInfo[index - 1].loginName == userInfo[index - 1].displayName) {
				//$(".customMiddleSide").append('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">The user ' + obj.val() + ' does not exist</div>');
				//$(".customMiddleSide").append(('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">The user {0} does not exist</div>').format(obj.val()));
				$(".customMiddleSide").append('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">' + (jQuery.i18n.prop("UserDoesNotExist")).format(obj.val()) + '</div>');
				userInfo.splice(index - 1, 1);
				obj.val("");
				exit = true;
				return false;
			}

			if (exit)
				return;

			fillUserList();
			addToUserLoginCombo();

			var employees = $(rootActors).find("employees");
			employees.append(createSpaceElement(1));
			employees.append(createElement("employee", obj.val()));
			employees.append(createNewLineElement(1));
			obj.val("");
			$.post("xml-write.php", {'fileName': 'actors.xml', 'xml' : $.xml(rootActors)},
			function(data, status){
				if (data.error) {
					alert("Data: " + data + "\nStatus: " + status);
				}
			}, "text");
		});
	});
	
	$(document).on("click", "#resetButton", function(){
		resetForm();
	});
	
	$(document).on("click", "#saveButton", function(){
		saveForm(this);
	});
/*
	$(document).on("click", "#newTaskItemButton", function(){
		newEditDialog();
		var el = $("#dialog-form-new");
		el.data("taskItem", null);
		el.dialog( "open" );
	});
*/
	$(document).on("click", ".editButton", function(){
		$( "#tabs" ).tabs( "option", "active", 1 );
		fillForm(this);	// this - an edit button context
		
		/*
		newEditDialog();
		var el = $("#dialog-form-new");
		el.data("taskItem", $(this)); 
		el.dialog( "open" );
		*/
	});

	var file_number = $( "#file_number" ),
		area = $( "#area" ),
		block = $( "#block" ),
		street = $( "#street" ),
		building = $( "#building" ),
		paci_number = $( "#paci_number" ),
		title = $( "#title" ),
		allFields = $( [] ).add(file_number).add(area).add(block).add(street).add(building).add(paci_number).add(title),
		tips = $( "#validateTips" );
	
	function updateTips( t ) {
		tips.text( t ).addClass( "ui-state-highlight" );
		setTimeout(function() {
			tips.removeClass( "ui-state-highlight", 1500 );
		}, 500 );
	}

	function isRequired( o, n ) {
		if ( o.val().length == 0 ) {
			o.addClass( "ui-state-error" );
			//updateTips( "Field " + n + " cannot be empty." );
			updateTips( $.i18n.prop("Field") + " " + n + " " + $.i18n.prop("CannotBeEmpty"));
			o.focus();
			return false;
		} else {
			return true;
		}
	}
	
	function checkLength( o, n, min, max ) {
		if ( o.val().length > max || o.val().length < min ) {
			o.addClass( "ui-state-error" );
			//updateTips( "Length of " + n + " must be between " + min + " and " + max + "." );
			updateTips( $.i18n.prop("LengthOf") + " " + n + " " + $.i18n.prop("MustBeBetween") + " " + min + " & " + max);
			o.focus();
			return false;
		} else {
			return true;
		}
	}
	function checkRegexp( o, regexp, n ) {
		if ( o.val().length == 0 )
			return true;
			
		if ( !( regexp.test( o.val() ) ) ) {
			o.addClass( "ui-state-error" );
			updateTips( n );
			return false;
		} else {
			return true;
		}
	}

	function fillForm(that) {		// edit a current doc
		allFields.removeClass( "ui-state-error" );

		that = $(that).parent();	//  a context of the current doc
		var form = $("#newForm");
		//form.data("currentItem", that);
		var fn = that.find('.docFileNumber span').text();
		form.find("#file_number").val(fn);
		//form.find("#file_number").attr('readonly','readonly');

		var address = that.find('.docAddress span').text().split(';');
		form.find("#area").val(address[0].trim());
		var v = address[1].split(':');
		form.find("#block").val(v[1].trim());
		v = address[2].split(':');
		form.find("#street").val(v[1].trim());
		v = address[3].split(':');
		form.find("#building").val(v[1].trim());

		form.find("#paci_number").val(that.find('.docPACINumber span').text());
		
		//var xmlNode = $(rootDoc).find("doc>docFileNumber:contains('" + fn + "')");
		//form.find("#title").val(xmlNode.siblings('docTitle').text());
		
		var title = '';
		if (rootDoc.constructor == XMLDocument) {
			title = $(rootDoc).find("doc>docFileNumber:contains('" + fn + "')").siblings('docTitle').text();
			//node = node.siblings('docTitle').text()
		} else {
			rootDoc[0].docs.some(function(key, index) {
				if (key.doc.docFileNumber == fn) {
					title = key.doc.docTitle;
					return true;
				}
			});
		}
		
		form.find("#title").val(title);
	}
	
	function saveForm(that) {
		var bValid = true;
		allFields.removeClass( "ui-state-error" );
		//bValid = bValid && checkLength( file_number, "File Number", 5, 5 );
		bValid = bValid && checkLength( file_number, $.i18n.prop("FileNumber"), 5, 5 );
		//bValid = bValid && checkRegexp( file_number, /^([0-9])+$/, "File Number field only allows : 0-9" );
		bValid = bValid && checkRegexp( file_number, /^([0-9])+$/, ($.i18n.prop("FieldOnlyAllows")).format($.i18n.prop("FileNumber"), " : 0-9")); //File Number field only allows : 0-9" 
		
		//bValid = bValid && isRequired( area, "Area" );
		//bValid = bValid && checkRegexp( area, /^[^:;]+$/, "Area field does not allow ':' ';'" );
		bValid = bValid && isRequired( area, $.i18n.prop("Area") );
		bValid = bValid && checkRegexp( area, /^[^:;]+$/, ($.i18n.prop("FieldOnlyAllows")).format($.i18n.prop("Area"), " ':' ';'"));

		//bValid = bValid && isRequired( block, "Block" );
		//bValid = bValid && checkRegexp( block, /^[^:;]+$/, "Block field does not allow ':' ';'" );
		bValid = bValid && isRequired( block, $.i18n.prop("Block") );
		bValid = bValid && checkRegexp( block, /^[^:;]+$/, ($.i18n.prop("FieldOnlyAllows")).format($.i18n.prop("Block"), " ':' ';'"));

		//bValid = bValid && isRequired( street, "Street" );
		//bValid = bValid && checkRegexp( street, /^[^:;]+$/, "Street field does not allow ':' ';'" );
		bValid = bValid && isRequired( street, $.i18n.prop("Street") );
		bValid = bValid && checkRegexp( street, /^[^:;]+$/, ($.i18n.prop("FieldOnlyAllows")).format($.i18n.prop("Street"), " ':' ';'"));


		//bValid = bValid && isRequired( building, "Building" );
		//bValid = bValid && checkRegexp( building, /^[^:;]+$/, "Building field does not allow ':' ';'" );
		bValid = bValid && isRequired( building, $.i18n.prop("Building") );
		bValid = bValid && checkRegexp( building, /^[^:;]+$/, ($.i18n.prop("FieldOnlyAllows")).format($.i18n.prop("Building"), " ':' ';'"));
		
		//bValid = bValid && checkRegexp( paci_number, /^([0-9]){8}$/, "PACI Number field only allows : 0-9 , length is 8" );
		bValid = bValid && checkRegexp( paci_number, /^([0-9]){8}$/, ($.i18n.prop("FieldOnlyAllows")).format($.i18n.prop("PACINumber"), $.i18n.prop("LengthIs8")));
		
		//bValid = bValid && isRequired( title, "Title" );
		bValid = bValid && isRequired( title, $.i18n.prop("Title") );

		/*
		bValid = bValid && checkRegexp( name, /^[a-z]([0-9a-z_])+$/i, "User name may consist of a-z, 0-9, underscores, begin with a letter." );
		// From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
		bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "Wrong e-mail address." );
		bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
		*/
		var form = $(that.form);							// form context
		//var file_number_val = form.find("#file_number").val();
		//var area_val = form.find("#area").val();
		//var block_val = form.find("#block").val();
		//var street_val = form.find("#street").val();
		//var building_val = form.find("#building").val();
		//var paci_number_val = form.find("#paci_number").val();
		//var title_val = form.find("#title").val();
		if ( bValid ) {

			var docNode, newDoc = true;
			if (rootDoc.constructor == XMLDocument) {
				docNode = $(rootDoc).find("doc>docFileNumber:contains('" + file_number.val() + "')");
				newDoc = (docNode.length == 0);
			} else {
				rootDoc[0].docs.some(function(key, index) {
					if (key.doc.docFileNumber == file_number.val()) {
						//docFileNumber = key.doc.docFileNumber;
						docNode = key.doc;
						newDoc = false;
						return true;
					}
				});
			}

			//var xmlNode = $(rootDoc).find("doc>docFileNumber:contains('" + file_number.val() + "')");
			if (!newDoc) {
				//var itemList = $("#newForm").data("currentItem");			// current doc context

				var item = $('#docs').find(".docFileNumber:contains('" + file_number.val() + "')").parent();
				
				var selTag = item.find('select');
				//xmlNode.find("docHistory>docApprover").text();
				//var nam = 'Submitted ' + getDate() + ' by ' + userInfo[0].displayName;
				var nam = getDate() + ' ' + userInfo[0].displayName;
				var html = '<option selected="selected" disabled="disabled" value="0">' + nam + '</option>';
				selTag.children("option").remove();
				selTag.append(html);
				
				var address = area.val() + "; " + 
						$.i18n.prop('Block') + ": " + block.val() + "; " + 
						$.i18n.prop('Street') + ": " + street.val() + "; " + 
						$.i18n.prop('Building') + ": " + building.val();
				item.find(".docAddress span").text(address);
				
				item.find(".docPACINumber span").text(paci_number.val());
			
				if (rootDoc.constructor == XMLDocument) {
					docNode = docNode.parent();
					docNode.find("docHistory>docDate").text(getDate());
					//xmlNode.find("docHistory>docApprover").text(userInfo[0].loginName);
					docNode.find("docHistory>docApprover").text(userInfo[0].displayName);
					docNode.children("docArea").text(area.val());
					docNode.children("docBlock").text(block.val());
					docNode.children("docStreet").text(street.val());
					docNode.children("docBuilding").text(building.val());
					docNode.children("docPACINumber").text(paci_number.val());
					docNode.children("docTitle").text(title.val());
				} else {	// new document
					var o = {"docDate": getDate(), "docApprover": userInfo[0].displayName};
					docNode.docHistory = o;
					docNode.docArea = area.val();
					docNode.docBlock = block.val();
					docNode.docStreet = street.val();
					docNode.docBuilding = building.val();
					docNode.docPACINumber = paci_number.val();
					docNode.docTitle = title.val();
				}
			} else {
				var dates = []; dates[0] = getDate();
				var names = []; names[0] = userInfo[0].displayName;
				//addDocToList($('.customMiddleSide #docs'), 0, 
				addDocToList($('#docs'), 0, 
							file_number.val(), dates, names, area.val(), block.val(), street.val(), building.val(), paci_number.val());

				if (rootDoc.constructor == XMLDocument) {
					appendSpaceElement(rootDoc.documentElement, 4);
					var doc = document.createElementNS("", "doc"); appendNewLineElement(doc, 8);
					var el = createElement("docFileNumber", file_number.val());
					doc.appendChild(el); appendNewLineElement(doc, 8);

					var docHistory = document.createElementNS("", "docHistory"); appendNewLineElement(docHistory, 12);
					el = createElement("docDate", getDate());
					docHistory.appendChild(el); appendNewLineElement(docHistory, 12);
					//el = createElement("docApprover", userInfo[0].loginName);
					el = createElement("docApprover", userInfo[0].displayName);
					docHistory.appendChild(el); appendNewLineElement(docHistory, 8);
					doc.appendChild(docHistory); appendNewLineElement(doc, 8);

					el = createElement("docArea", area.val());
					doc.appendChild(el); appendNewLineElement(doc, 8);
					
					el = createElement("docBlock", block.val());
					doc.appendChild(el); appendNewLineElement(doc, 8);
					
					el = createElement("docStreet", street.val());
					doc.appendChild(el); appendNewLineElement(doc, 8);
					
					el = createElement("docBuilding", building.val());
					doc.appendChild(el); appendNewLineElement(doc, 8);

					el = createElement("docPACINumber", paci_number.val());
					doc.appendChild(el); appendNewLineElement(doc, 8);

					el = createElement("docTitle", title.val());
					doc.appendChild(el); appendNewLineElement(doc, 8);
					
					el = document.createElementNS("", "docComment");
					doc.appendChild(el); appendNewLineElement(doc, 4);
					
					rootDoc.documentElement.appendChild(doc); appendNewLineElement(rootDoc.documentElement, 0);
				} else {
					var doc = {};
					doc.docFileNumber = file_number.val();
					doc.docHistory = {"docDate": getDate(), "docApprover": userInfo[0].displayName};
					doc.docArea = area.val();
					doc.docBlock = block.val();
					doc.docStreet = street.val();
					doc.docBuilding = building.val();
					doc.docPACINumber = paci_number.val();
					doc.docTitle = title.val();
					rootDoc[0].docs.push({"doc": doc});
				}
			}

		var url, data;
		if (documentSource == "XML") {
			url = "xml-write.php";
			data = {'fileName': 'docs.xml', 'xml' : $.xml(rootDoc)};
			//dataType = "text";
		} else {
			url = "json_db_crud_pdo.php";
			data = {"func":"createUpdate",
				"param":{
					docFileNumber:file_number.val(),
					docApprover:userInfo[0].displayName,
					docDate:getDate(),
					docArea:area.val(),
					docBlock:block.val(),
					docStreet:street.val(),
					docBuilding: building.val(),
					docPACINumber:paci_number.val(),
					docTitle:title.val(),
				}};
			//dataType = "json";
		}

		$.post(url, data)
			.done(function(data){
				//if (data.error) {
				//	alert("Data: " + data + "\nStatus: " + status);
				//}
				if (data && data.constructor == Array) {
					if (data[0].error != undefined) {
						if (data[0].error == "1003")
							alert(($.i18n.prop("ApprovedCannotBeModified")).format(file_number.val()));
						else
							alert(data[0].error);
					}
				} else {
					var areas = $(rootAreas).find("areas");
					if (areas.attr("dirty") == "yes") {
						areas.removeAttr("dirty");
						$.post("xml-write.php", {'fileName': 'areas.xml', 'xml' : $.xml(rootAreas)},
						function(data, status){
							if (data.error) {
								alert("Data: " + data + "\nStatus: " + status);
							}
						}, "text");
					}
				}
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				alert("saveDocs - error: " + errorThrown);
			})
			.always(function() {
			});
			
//			if (newDoc) {
				//selectXmlNodes(status_enum.approve);
/*
				//var emailToVal = "ridavidenko@mewj.gov.kw";
				var emailToVal = "rid50@hotmail.com";
				//var emailFromVal = "ridavidenko@mewj.gov.kw";
				var emailFromVal = "rdavidenko@gmail.com";
				//var emailFromVal = "rid50@mail.ru";
				var subjectVal = "Your attention is required (" + paci_number.val() + ")";
				var messageVal = "You are assigned for an approval of the document N " + paci_number.val() + " ( http://mewdesigncomps )";
				$.post("sendEmail.php",
					{ emailTo: emailToVal, emailFrom: emailFromVal, subject: subjectVal, message: messageVal },
					function(data){}
				); 
				//$( this ).dialog( "close" );
*/				
//			}
		}
	}
/*				
	newEditDialog = function() {
		//$( "#dialog-form-new" ).dialog({
		$( "#newForm" ).dialog({
			//title:jQuery.i18n.prop('RegisterNewDoc'),
			autoOpen: true,
			height: 460,
			width: 480,
			modal: true,
			//buttons: {
			//	"Send2": Send,
			//	Cancel: function() {
			//		$( this ).dialog( "close" );
			//	}
			//},
			//close: function() {
			//	allFields.val( "" ).removeClass( "ui-state-error" );
			//},
//			open: function( event, ui ) {
//				var that = $(this);
//			}
		});
	};
*/	
	$( document ).tooltip({
		//items: ".taskDetailDiv, .taskDetailDiv select, .taskDetailDiv a, .customSearchGo",
		items: ".docDetailDiv, .docDetailDiv select, .docDetailDiv a",
		show: {	effect: "fadeIn", delay: 1000, duration: 500 },
		content: function() {
			var element = $(this);
			//if ( element.is( ".taskDetailDiv a" ) || element.is( ".customSearchGo" ) ) {
			//	$( document ).tooltip( {tooltipClass: "ui-tooltip-for-button"} );
			//	return element.attr( "title" );
			//}
			if ( element.is( ".docDetailDiv a" ) || element.is( ".docDetailDiv select" ) ) {
				return;
			}
				
			$( document ).tooltip( {tooltipClass: "ui-tooltip-for-item"} );
			//var item = element.find(".taskDescription").clone();
			
			var fn = element.find(".docFileNumber span").text();
			
			var title = '';
			if (rootDoc.constructor == XMLDocument) {
				title = $(rootDoc).find("doc>docFileNumber:contains('" + fn + "')").siblings('docTitle').text();
				//node = node.siblings('docTitle').text()
			} else {
				rootDoc[0].docs.some(function(key, index) {
					if (key.doc.docFileNumber == fn) {
						title = key.doc.docTitle;
						return true;
					}
				});
			}
			
			var direction = "floatLeft";
			if ($("body[dir='rtl']").length)
				direction = "floatRight";
			
			//var html = '<div class="' + direction + '">' + node.siblings('docTitle').text() + "</div><br/>";
			var html = '<div class="' + direction + '">' + title + "</div><br/>";

			$(html).show();
			return html;
		}
	});
	
});

function fillUserList() {
	var a = [];
	userInfo.forEach(function(o, index) {
		if (index != 0)
			a.push(o.displayName + "|" + o.loginName);
			//a.push(o.displayName + " (" + o.loginName + ") ");
	});
	
	a.sort(
		function(a, b) {
			if (a.toLowerCase() < b.toLowerCase()) return -1;
			if (a.toLowerCase() > b.toLowerCase()) return 1;
			return 0;
		}
	);

	$("#userList>ul>li").remove();
	
	a.forEach(function(name){
		name = name.split('|');
		$("#userList>ul").append('<li class="ui-state-default jstree-draggable">' + name[0] + '<span class="hiddenElement">' + name[1] + '</span></li>');
	});
}

userAssignment = function() {
	//$.get( "actors.xml", 
		//function( data ) {
		$(function() {
/*
			var a = [];
				
			userInfo.forEach(function(o, index) {
				if (index != 0)
					a.push(o.displayName + "|" + o.loginName);
					//a.push(o.displayName + " (" + o.loginName + ") ");
			});
			
			a.sort(
				function(a, b) {
					if (a.toLowerCase() < b.toLowerCase()) return -1;
					if (a.toLowerCase() > b.toLowerCase()) return 1;
					return 0;
				}
			);

			a.forEach(function(name){
				//getUserIdentities("GetUserInfo", '{"loginName":"' + name + '"}');
				//$("#userList>ul").append('<li class="ui-state-default jstree-draggable">' + displayName + " (" + loginName + ") </li>");
				name = name.split('|');
				$("#userList>ul").append('<li class="ui-state-default jstree-draggable">' + name[0] + '<span class="hiddenElement">' + name[1] + '</span></li>');
			});
*/			
			fillUserList();
			
			var managers, employees, val;
			$(rootActors).find('section').each(function(section_index) {
				$("#custom_jsTree>ul").append('<li rel="department" id="' + section_index + '"><a href="#">' + $(this).attr('name') + '</a></li>');
				managers = $(this).find('manager');
				if (managers.length != 0) {
					$("#custom_jsTree>ul>li:last-child").append('<ul></ul>');
					managers.each(function(manager_index) {
						//$("#custom_jsTree>ul>li:last-child>ul").append('<li><a href="#">' + $(this).attr('name') + '</a></li>');
						//$("#userList ul").append('<li class="ui-state-default">' + $(this).attr('name') + "</li>");
						val = $(this).attr('name');
						
						userInfo.every(function(o) {
							if (o.loginName == val) {
								val = o.displayName;
								return false;
							}
							return true;
						});

						//if (a.indexOf(val) == -1)
						//	a.push(val);
						
						//getUserIdentities("GetUserInfo", '{"loginName":"' + val + '"}');
						//val = displayName + " (" + loginName + ") ";
						
						//$("#custom_jsTree>ul>li:last-child>ul").append('<li id="' + section_index + '_' + manager_index + '"><a href="#">' + val + '</a></li>');
						//$("#custom_jsTree>ul>li:last-child>ul").append('<li><a href="#" data-loginName="' + $(this).attr('name') + '">' + val + '</a></li>');
						//$("#custom_jsTree>ul>li:last-child>ul").append('<li><a href="#">' + val + '</a></li>');
						$("#custom_jsTree>ul>li:last-child>ul").append('<li rel="employee"><a href="#">' + val + '<span class="hiddenElement">' + $(this).attr('name') + '</span></a></li>');
						employees = $(this).find('employee');
						if (employees.length != 0) {
							$("#custom_jsTree>ul>li:last-child>ul>li:last-child").append('<ul></ul>');
							employees.each(function(employee_index) {
								//$("#custom_jsTree>ul>li:last-child>ul>li:last-child>ul").append('<li><a href="#">' + $(this).text() + '</a></li>');
								val = $(this).text();

								userInfo.some(function(o) {
									if (o.loginName == val) {
										val = o.displayName;
										return true;
									}
									return false;
								});

								//getUserIdentities("GetUserInfo", '{"loginName":"' + val + '"}');
								//val = displayName + " (" + loginName + ") ";
								
								//$("#custom_jsTree>ul>li:last-child>ul>li:last-child>ul").append('<li id="' + section_index + '_' + manager_index + '_' + employee_index + '"><a href="#">' + val + '</a></li>');
								//$("#custom_jsTree>ul>li:last-child>ul>li:last-child>ul").append('<li><a href="#" data-loginName="' + $(this).text() + '">' + val + '</a></li>');
								//$("#custom_jsTree>ul>li:last-child>ul>li:last-child>ul").append('<li><a href="#">' + val + '</a></li>');
								$("#custom_jsTree>ul>li:last-child>ul>li:last-child>ul").append('<li rel="employee"><a href="#">' + val + '<span class="hiddenElement">' + $(this).text() + '</span></a></li>');

								//if (a.indexOf(val) == -1)
									//a.push(val);
								//$("#userList ul").append('<li class="ui-state-default">' + $(this).text() + "</li>");
							})
						}
					})
				}
			})
/*
			var loginNames = new Array();
			a.forEach(function(name){
				var personInfo = {};
				personInfo.loginName = name;
				loginNames.push(personInfo);
			});
			
			getUserIdentities("GetUserInfo", loginNames);
			//$('#userName').text(json_text);

			
			

			a.forEach(function(name){
				//getUserIdentities("GetUserInfo", '{"loginName":"' + name + '"}');
				//$("#userList>ul").append('<li class="ui-state-default jstree-draggable">' + displayName + " (" + loginName + ") </li>");
				$("#userList>ul").append('<li class="ui-state-default jstree-draggable">' + name + "</li>");
			});
*/			
			//$("#userList>ul").sortable({ revert:true });
			//$("#userList>ul>li").draggable({helper: "clone", cursor: "move", revert: "valid", containment: ".customMiddleSide", scroll: false, opacity: 0.7, zIndex: 100  });
			$("#userList>ul>li").draggable({helper: "clone", cursor: "move", revert: "valid", scroll: false, opacity: 0.7, zIndex: 100  });
			$("#sortable>ul").disableSelection();
			
			$("#custom_jsTree")
				.bind("loaded.jstree", function (e, data) {
					$("#userAssignmentDiv").show();
					
					var found = false;
					superuser.some(function(name) {
						if (userInfo[0].loginName == name) {
							//$("#custom_jsTree").jstree("open_all");
							$("#custom_jsTree").jstree("open_node", $("#custom_jsTree>ul>li"));
							found = true;
							return true;
						}
					})

					if (!found) {
						var tree_size = $("#custom_jsTree>ul>li").length;
						for (var i = 0; i < tree_size; i++) {
							if (i == actorSectionNumber)
								$("#custom_jsTree").jstree("open_node", $("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")"));
							else
								$("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")").hide();
						}
					}
				})
				.bind("select_node.jstree", function (event, data) {
					//data.inst.delete_node(data.rslt.obj);
				})
				.bind("before.jstree", function (e, data) {
					if (data.func === "remove" && !confirm("Are you sure?")) {
						e.stopImmediatePropagation();
						return false;
					}
/*
					else
					if (data.func === "rename") {
						var c = 0;
						//alert(data.rslt.new_name);
						e.stopImmediatePropagation();
						return false;
					} else
					if (data.func === "create") {
						var d = 0;
						//alert(data.rslt.new_name);
						e.stopImmediatePropagation();
						return false;
					}
*/					
				})
/*				
				.bind("create_node.jstree", function (e, data) {
				var b = 0;
					saveActors();
						//alert(data.rslt.new_name);
					e.stopImmediatePropagation();
					return false;
				})
				.bind("rename_node.jstree", function (e, data) {
				var a = 0;
						//alert(data.rslt.new_name);
					saveActors();
						//alert(data.rslt.new_name);
					e.stopImmediatePropagation();
					return false;
				})
*/				
				.bind("rename.jstree", function (e, data) {
				//var a = 0;
						//alert(data.rslt.new_name);
					saveActors();
						//alert(data.rslt.new_name);
						e.stopImmediatePropagation();
						return false;
				})
				.bind("remove.jstree", function (e, data) {
					e.stopImmediatePropagation();
					saveActors();
					//alert(data.rslt.new_name);
					return false;
				})
				.jstree({
					"core" : { 
						//"initially_open" : [ "Follow Up", "AC" ] 
					},
					"dnd" : {
						"drop_finish" : function () { 
							alert("DROP"); 
						},
						"drag_check" : function (data) {
							var exit = false;
							var node = $("#custom_jsTree");
							$(node).find('ul li a>span').each(function() {
								if ($(this).text() == $(data.o).children('span').text()) {
									exit = true;
									return false;
								}
							});
							
							if (exit)
								return false;
							
							if ($(data.r).parentsUntil("#custom_jsTree", "li").length > 1)
								return false;

						/*	
							var node = data.r;
							if (this.is_leaf(node))
								node = this._get_parent(data.r);

							var exit = false;
							$(node).find('ul>li>a>span').each(function() {
								if ($(this).text() == $(data.o).children('span').text()) {
									exit = true;
									return false;
								}
							});
						*/	
							//if (exit)
							//	return false;
								
							//var v = 0;
							//if ($(data.r).find('a>span').text() == $(data.o).children('span').text())
								//return false;
								
							//if (this._get_parent(data.r) == -1)
							//	return false;

							//if(data.r.attr("id") == "phtml_1") {
							//	return false;
							//}
							return { 
								after : false, 
								before : false, 
								inside : true 
							};
						},
						"drag_finish" : function (data) { 
							//data.r[0].children[1].text = data.o.innerHTML;
							var node = data.r;
							
							//var liNodes = $(node).closest("li", "#custom_jsTree").length;
							if ($(node).parentsUntil("#custom_jsTree", "li").length < 2) {
								this.create_node(node, "first", {data: data.o.childNodes[0].textContent }, false, false);
								$(node).find('ul>li').attr('rel', 'employee');
								$(node).find('ul>li:first>a').append('<span class="hiddenElement">' + data.o.childNodes[1].textContent + '</span>');
								
								saveActors();
							}
							/*
							if (this.is_leaf(node)) {
								this.rename_node(node, data.o.childNodes[0].textContent);
								$(node).find('a>span').text(data.o.childNodes[1].textContent);
								//this.set_text(node, data.o.child[0]);
							} else {
								this.create_node(node, "first", {data: data.o.childNodes[0].textContent }, false, false);
								$(node).find('ul>li:first>a').append('<span class="hiddenElement">' + data.o.childNodes[1].textContent + '</span>');
							}
							*/
							//saveActors();
							//var i = 0;
							//alert(this._get_parent(data.r)); 
						}
					},
					"crrm" : {
						"move" : {
							"default_position" : "first",
							"check_move" : function (m) {
								//return (m.o[0].id === "thtml_1") ? false : true;
								return false;
							}
						}
					},
					"hotkeys" : {
						"f2" :  function (event) {
							if (this.is_selected()) {
								if (this._get_parent(this._get_node()) == -1)							
									this.rename();
							}
							return false;

							//var node = this._get_node();
							//if(!node) {
							//	alert("no node selected");   
							//}
							//else {
							//	alert("selected node: "+this.get_text(node));
							//}
						},
						"del" : function () {
							this.remove();
						}
					},
					"themes" : {
						"theme" : "classic",
						"dots" : true,
						"icons" : true
					},
					"types" : {
						"types" : {
							"department" : {
								"icon" : {
									"image" : "images/users.png"
								}
							},
							"employee" : {
								"icon" : {
									"image" : "images/user.png"
								}
							}
						}
					},
					//callback: {
					//	onselect: function(NODE, TREE_OBJ) {
					//		alert(NODE.id);
					//	}
					//},
					
					"plugins" : [ "themes", "html_data", "ui", "crrm", "hotkeys", "dnd", "types" ]
				});
		})
	//);
};

saveActors = function() {
	var department, section, mamagers, manager, employee;
	//var department = document.createElementNS("", "department");
	var department = createElementWithAttribute("department", 'superuser', $(rootActors).find('department').attr('superuser'));
	appendNewLineElement(department, 1);
	var sections = document.createElementNS("", "sections");
	department.appendChild(sections);  
	$("#custom_jsTree>ul>li").children('a').each(function(index) {
		appendNewLineElement(sections, 2);
		section = createElementWithAttribute("section", 'name', $(this).text().trim());
		sections.appendChild(section);  
		appendNewLineElement(section, 3);
		managers = document.createElementNS("", "managers");
		section.appendChild(managers);
		$(this).siblings('ul').children('li').children('a').each(function(index) {
			appendNewLineElement(managers, 4);
			//manager = createElementWithAttribute("manager", 'name', $(this).text());
			manager = createElementWithAttribute("manager", 'name', $(this).children('span').text());
			managers.appendChild(manager);
			$(this).siblings('ul').children('li').children('a').each(function(index) {
				appendNewLineElement(manager, 5);
				//employee = createElement("employee", this.data.loginName);
				//employee = createElement("employee", $(this).text());
				employee = createElement("employee", $(this).children('span').text());
				manager.appendChild(employee);
				//$("#userName").append('<div>' + $(this).text() + ' -- (' + index + ')</div>')
			})
			appendNewLineElement(manager, 4);
		}) 
		appendNewLineElement(managers, 3);
		appendNewLineElement(section, 2);
	});
	appendNewLineElement(sections, 1);
	appendNewLineElement(department, 1);
	var employees = $(rootActors).find("department>employees").clone();
	$(department).append(employees);
	appendNewLineElement(department, 0);
	
	$.ajaxSetup({ cache: false, async: true });
	$.post("xml-write.php", {'fileName': 'actors.xml', 'xml' : $.xml(department)})
		.always(function() {
			$.ajaxSetup({ cache: false, async: false });
		});
}

function toggleLanguage(lang, dir) {
	var left = $(".floatLeft");
	var right = $(".floatRight");
	//var direction = (dir == 'ltr') ? true : false; 
	var direction = false; 
	$(left).toggleClass("floatLeft", direction);
	$(left).toggleClass("floatRight", !direction);
	$(right).toggleClass("floatRight", direction);
	$(right).toggleClass("floatLeft", !direction);
	$('body').attr('dir', dir);
	$('html').attr('lang', lang);
	jQuery.i18n.properties({
		name:'Messages', 
		path:'bundle/', 
		mode:'both',
		language: lang,
		callback: function() {
			
			$( "#datepicker").datepicker( "option", $.datepicker.regional[ (lang == "en") ? "" : lang ] );
			$( "#datepicker2").datepicker( "option", $.datepicker.regional[ (lang == "en") ? "" : lang ] );
			$("#datepicker").datepicker( "option", "dateFormat", "dd/mm/yy" );
			$("#datepicker2").datepicker( "option", "dateFormat", "dd/mm/yy" );
			
			var change = true;
			if (lang == "ar")
				change = false;
				
			$("#datepicker").datepicker("option", "changeMonth", change);
			$("#datepicker2").datepicker("option", "changeMonth", change);
		
			$('#Copyright').text(jQuery.i18n.prop('Copyright'));
			$('#MediaCenter').text(jQuery.i18n.prop('MediaCenter'));
			$('#ContactUs').text(jQuery.i18n.prop('ContactUs'));
			$('#CustomerService').text(jQuery.i18n.prop('CustomerService'));
			$('#SiteMap').text(jQuery.i18n.prop('SiteMap'));
			$('#TrainingProgram').text(jQuery.i18n.prop('TrainingProgram'));
			$('#PrivacyPolicy').text(jQuery.i18n.prop('PrivacyPolicy'));
			
			$('#LogIn').text(jQuery.i18n.prop('LogIn'));
			$('#status').text(jQuery.i18n.prop('Status'));
			$('#reject').text(jQuery.i18n.prop('Rejected'));
			$('#approve').text(jQuery.i18n.prop('InProgress'));
			$('#complete').text(jQuery.i18n.prop('Completed'));
			
			$("#tabs>ul>li").find('a[href="#tabs-1"]').text(jQuery.i18n.prop("DocumentListTab"));
			$("#tabs>ul>li").find('a[href="#tabs-3"]').text(jQuery.i18n.prop("PendingDocumentListTab"));
			$("#tabs>ul>li").find('a[href="#tabs-4"]').text(jQuery.i18n.prop("RejectedDocumentListTab"));
			if (actor == actor_enum.manager)
				$("#tabs>ul>li").find('a[href="#tabs-2"] span').text(jQuery.i18n.prop("UserAssignmentTab"));
			else if (actor == actor_enum.employee)
				$("#tabs>ul>li").find('a[href="#tabs-2"] span').text(jQuery.i18n.prop("CreateNewDocumentTab"));
			
			if (dir == 'ltr') {
				$(".customRightSide").css("text-align", "right");
				$(".customMiddleSide, .customRightSide, #userList").css("box-shadow", "4px 4px 2px #999");
				$(".customMiddleSide #docs li, .docButtons").css("box-shadow", "2px 2px 2px #999");

			//	$(".docDetailDiv select").css({'margin-left':'20px', 'margin-right':0});
			//	$(".docPACINumber").css({'margin-left': 0, 'margin-right':'20px'});
			} else {
				$(".customRightSide").css("text-align", "left"); 
				$(".customMiddleSide, .customRightSide, #userList").css("box-shadow", "-4px 4px 2px #999");
				$(".customMiddleSide #docs li, .docButtons").css("box-shadow", "-2px 2px 2px #999");
			//	$(".docDetailDiv select").css({'margin-left':0, 'margin-right':'20px'});
			//	$(".docPACINumber").css({'margin-left':'20px', 'margin-right':0});
			}
			
			//$("#newForm").attr('title', jQuery.i18n.prop('RegisterNewDoc'));
			$("#saveButton").button({label: jQuery.i18n.prop('Save')});
			$("#saveButton").attr({title: jQuery.i18n.prop('InsertOrUpdate')});
			$("#resetButton").button({label: jQuery.i18n.prop('Reset')});
			$("#resetButton").attr({title: jQuery.i18n.prop('ResetFields')});
			$("#addUserButton").button({ label: $.i18n.prop('AddUser')});
			
			$('#validateTips').html(jQuery.i18n.prop('ValidateTips'));
			$('label[for="file_number"]').html('<strong>' + jQuery.i18n.prop('File') + '</strong>');
			$('label[for="area"]').html('<strong>' + jQuery.i18n.prop('Area') + '</strong>');
			$('label[for="block"]').html('<strong>' + jQuery.i18n.prop('Block') + '</strong>');
			$('label[for="street"]').html('<strong>' + jQuery.i18n.prop('Street') + '</strong>');
			$('label[for="building"]').html('<strong>' + jQuery.i18n.prop('Building') + '</strong>');
			$('label[for="paci_number"]').html(jQuery.i18n.prop('PACI'));
			$('#labTitle').html('<strong>' + jQuery.i18n.prop('Title') + '</strong>');
			$('.docFileNumber>div').html('<strong>' + jQuery.i18n.prop('File') + ':&nbsp;</strong>');
			$('.docAddress>div').html('<strong>' + jQuery.i18n.prop('Address') + ':&nbsp;</strong>');
			$('.docPACINumber>div').html('<strong>' + jQuery.i18n.prop('PACI') + ':&nbsp;</strong>');

			$("#approver_search>option:first").html('--- ' + jQuery.i18n.prop('Select') + ' ---');
			//$("#area_search>option:first").html('--- ' + jQuery.i18n.prop('Select') + ' ---');
			
			//$("#accordion>span:nth-child(1)>:nth-child(1)").text(jQuery.i18n.prop('Search'));
			var obj = $("#accordion>span:nth-child(1)").contents().filter(function() {return this.nodeType == 3;});
			obj.get()[0].textContent = jQuery.i18n.prop('Search');
			$("#accordion>div>div:first>span").text(jQuery.i18n.prop('File'));
			$("#accordion>div>div:nth-child(2)>span").text(jQuery.i18n.prop('PACI'));
			$("#accordion>div>div:nth-child(3)>span").text(jQuery.i18n.prop('Approver'));
			$("#accordion>div>div:nth-child(4)>span").text(jQuery.i18n.prop('DateFrom'));
			$("#accordion>div>div:nth-child(5)>span").text(jQuery.i18n.prop('DateTo'));
			$("#accordion>div>div:nth-child(6)>span").text(jQuery.i18n.prop('Area'));
			$("#accordion>div>div:nth-child(7)>span").text(jQuery.i18n.prop('Block'));
			$("#accordion>div>div:nth-child(8)>span").text(jQuery.i18n.prop('Street'));
			$("#searchButton").button({ label: $.i18n.prop('Search')});
			$("#searchResetButton").button({ label: $.i18n.prop('Reset')});

			//$("#accordion>span:nth-child(3)").text(jQuery.i18n.prop('Report'));
			obj = $("#accordion>span:nth-child(3)").contents().filter(function() {return this.nodeType == 3;});
			obj.get()[0].textContent = jQuery.i18n.prop('Report');
			$("#reportPrintButton").button({ label: $.i18n.prop('Print')});
			
			$(".docPrintAnchor").text(jQuery.i18n.prop('Print'));
			$(".docCommentAnchor").text(jQuery.i18n.prop('Comment'));
			
			$("#report_list option").remove();
			var selectTag = $("#report_list");
			selectTag.append('<option value="byAddress">' + $.i18n.prop("ByAddress") + '</option>');
			selectTag.append('<option value="byApprover">' + $.i18n.prop("ByApprover") + '</option>');
			
				
		}				
	});
}

var pdfFileName;
function onLoadPDFHandler(e) {
	//alert("All done!");
	//$.post("delete_pdf_file.php", {fileName:fileName})
	setTimeout(function () {
		$.post("delete_pdf_file.php", {fileName:pdfFileName})
		//alert("All done!");
	}, 100);
}

var pdfWin;
function openPDFFile(fileName) {
	pdfFileName = fileName;
	pdfWin = window.open(fileName);
	pdfWin.onclose = onLoadPDFHandler;
/*	
	pdfWin.onload = function () {
		//setTimeout(function () {
			$.post("delete_pdf_file.php", {fileName:fileName})
			//alert("All done!");
		//}, 100);
	}
*/	
	//var t = 0;
}

function printReport() {
	var url, data;
	if (documentSource == "XML") {
		alert("Not implemented for XML document source");
		return;
	} else {
		url = "print_doc.php";
		//data = {"func":"get", "param":{docFileNumber: fileNumber, filter:{actorRole:actorSectionNumber}}};
		data = {"func":$("#report_list").val(), "param":{filter:getSearchFilter()}};
	}

//debugger;
		
	$.ajaxSetup({ cache: false, async: true });
	$.get(url, data, null, "json")
		.done(function( data ) {
			if (data.constructor == Array) {
				if (data[0].error != undefined) {
					alert (data[0].error);
					return;
				}
			}

			//pdfFileName = data[0].pdf_file_name;
			pdfWin = window.open(data[0].pdf_file_name);
			setTimeout(function () {
				$.post("delete_pdf_file.php", {fileName:data[0].pdf_file_name})
			}, 500);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			alert("printReport - error: " + errorThrown);
		})
		.always(function() {
			$.ajaxSetup({ cache: false, async: false });
		});
}

$(document).on("click", ".docCommentAnchor", function(e){
	e.preventDefault();
	commentDialog(this, "readonly");
})

$(document).on("click", ".docPrintAnchor", function(e){
	e.preventDefault();
	$.ajaxSetup({ cache: false, async: true });
	//$.blockUI();

	//var options = { mode : "iframe", popClose : "false" };
	//$(".customMiddleSide").printArea({ mode : "iframe", popClose : "false" });
	//$(".customMiddleSide #docs").printThis();

	//e.stopImmediatePropagation();
	//$(this).next().find("span").text()
	var fileNumber = $(this).parent().find(".docFileNumber span").text();
	//return;
	var url, data;
	if (documentSource == "XML") {
		url = "print_doc_xml.php";
		data = {'fileNumber': fileNumber};
	} else {
		url = "print_doc.php";
		//data = {"func":"get", "param":{docFileNumber: fileNumber, filter:{actorRole:actorSectionNumber}}};
		data = {"func":"byFileNumber", "param":{docFileNumber: fileNumber, filter:{actorRole:actorSectionNumber}}};
	}

	//$.get("tcpdf/arab.php", {'fileNumber': '456789'},
	$.get(url, data, null, "json")
		.done(function( data ) {
			if (data.constructor == Array) {
				if (data[0].error != undefined) {
					alert (data[0].error);
					return;
				}
			}

			//pdfFileName = data[0].pdf_file_name;
			pdfWin = window.open(data[0].pdf_file_name);
			setTimeout(function () {
				$.post("delete_pdf_file.php", {fileName:data[0].pdf_file_name})
			}, 500);
			//pdfWin.onload = onLoadPDFhandler;
			
			//openPDFFile(data[0].pdf_file_name);
/*			
			var strFrameName = ("print-" + (new Date()).getTime());
			var $frame = $('<iframe id="' + strFrameName + '" name="printIframe" src="' + data[0].pdf_file_name + '" onload="alert(\'kuku\');"/>');
			$frame.appendTo("body");

			var $iframe = $("#" + strFrameName);
			
			$iframe.css({
				position: "absolute",
                width: "100px",
                height: "100px",
                left: "2px",
                top: "2px"
            });

			$iframe[0].contentWindow.focus();
			$iframe[0].contentWindow.print();  
*/			
/*			
				//var win = window.open(data[0].pdf_file_name,'_newtab');
				pdfWin = window.open(data[0].pdf_file_name);
				pdfWin.onclose = function () {
					//setTimeout(function () {
						$.post("delete_pdf_file.php", {fileName:data[0].pdf_file_name})
					//alert("All done!");
					//}, 500);
				}
*/
			//alert("kuku");
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			alert("printDoc - error: " + errorThrown);
		})
		.always(function() {
			$.ajaxSetup({ cache: false, async: false });
			//$.unblockUI();
		});
	
	
	
	
	
		//function(data, status){
			//window.location = "arab.pdf";
			//window.open('tcpdf/arab.pdf','_newtab');
			//window.open('tcpdf/arab.pdf','_blank');
			//if (data.error)
			//	alert("Data: " + data + "\nStatus: " + status);
			//else
			//	alert("Data: " + data + "\nStatus: " + status);
			
/*			
			// Create a random name for the print frame.
			var strFrameName = ("print-" + (new Date()).getTime());
            if(window.location.hostname !== document.domain && navigator.userAgent.match(/msie/i)){
                // Ugly IE hacks due to IE not inheriting document.domain from parent
                // checks if document.domain is set by comparing the host name against document.domain
                var iframeSrc = "javascript:document.write(\"<head><script>document.domain=\\\"" + document.domain + "\\\";</script></head><body></body>\")";
                var printI= document.createElement('iframe');
                printI.name = "printIframe";
                printI.id = strFrameName;
                printI.className = "MSIE";
                document.body.appendChild(printI);
                printI.src = iframeSrc;
            } else {
                // other browsers inherit document.domain, and IE works if document.domain is not explicitly set
				// Create an iFrame with the new name.
				//var $frame = $('<iframe id="' + strFrameName + '" name="printIframe" src="tcpdf/arab.pdf" onload="alert(\'kuku\');"/>');
				//var $frame = $('<iframe id="' + strFrameName + '" name="printIframe" src="tcpdf/arab.pdf" onload="window.frames[\'printIframe\'].focus();window.print();"/>');
				//var $frame = $('<iframe id="' + strFrameName + '" name="printIframe" src="tcpdf/arab.pdf" onload="javascript:document.getElementById(\'' + strFrameName + '\').contentWindow.focus();javascript:document.getElementById(\'' + strFrameName + '\').contentWindow.print();"/>');
				//var $frame = $('<iframe id="' + strFrameName + '" name="printIframe" src="tcpdf/arab.pdf"/>');
				var $frame = $('<iframe id="' + strFrameName + '" name="printIframe" src="xml_print.php?fileNumber=45678"/>');
				$frame.appendTo("body");
            }
			
			var $iframe = $("#" + strFrameName);
			
			$iframe.css({
				position: "absolute",
                width: "100px",
                height: "100px",
                left: "2px",
                top: "2px"
            });
			
			setTimeout ( function () {
				var $doc = $iframe.contents();
				
				setTimeout(function () {
					if (navigator.userAgent.match(/msie/i)) {
						var dok = document.getElementById(strFrameName);
						dok.print();
						//window.frames["printIframe"].focus();
						//window.frames["printIframe"].print();
					} else
					if ($iframe.hasClass("MSIE")){
						// check if the iframe was created with the ugly hack
						// and perform another ugly hack out of neccessity
						window.frames["printIframe"].focus();
						$doc.find("head").append("<script>  window.print(); </script>");
					} else {
						// proper method
						$iframe[0].contentWindow.focus();
						$iframe[0].contentWindow.print();  
					}
					
					//remove iframe after print
					setTimeout(function () {
						//$iframe.remove();
					}, 1000);
					
				}, 1000);			
			
            }, 100);			
*/			
		//}, "text"
	//);
})

function alert(text) {
	var form = $('<div/>');
    form.html(text);
    form.dialog({
        title:jQuery.i18n.prop('Alert'),
		dialogClass: "no-close",
        height: 200,
        width: 400,
        modal: true,
		autoOpen: true,
        buttons: { 
			Ok: function() {
				$(this).dialog( "close" );
			},
		},
	});
}

function setbg(color)
{
	document.getElementById("title").style.background=color;
}