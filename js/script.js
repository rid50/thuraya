var status_enum = {
	//submit: "submit",
	approve: "approve",
	reject: "reject",
	revoke: "revoke",
	//checkup: "checkup",
	readonly: "readonly",
	//all: "all"
};

var actor_enum = {
	manager: 0x1,
	employee: 0x2
};

var sectionId_enum = {
	followup: "0",
	ac: "1",
	electricity: "2",
	checkup: "3",
	edafat: "4",
};

var activeTab_enum = {
	pending: 0,
	inprocess: 1,
	vault: 2,
	rejected: 3,
	edafat: 4,
	edit: 5,
	users: 6,
};

/*
var tab_enum = {
	pending: 0,
	inprocess: 1,
	complete: 2,
	rejected: 3,
	users: 4,
};
*/
var idp;
var documentSource;
var lang;

var userInfo;

var rootDoc;
var rootActors;
var rootAreas;
var superuser;
var actor;
//var actorSectionNumber;
var sectionId;				// id of  section of the department, like: follow_up, ac...
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

		$("#date_submission").datepicker({
			changeMonth: true,
			changeYear: true,
			//showButtonPanel: true,
		});
		
		$("#datepicker").datepicker( $.datepicker.regional[ "" ] );
		$("#datepicker").datepicker( "option", "dateFormat", "dd/mm/yy" );
		$("#datepicker2").datepicker( $.datepicker.regional[ "" ] );
		$("#datepicker2").datepicker( "option", "dateFormat", "dd/mm/yy" );
		$("#date_submission").datepicker( $.datepicker.regional[ "" ] );
		$("#date_submission").datepicker( "option", "dateFormat", "dd/mm/yy" );

		//$("#datepicker").datepicker( "setDate", "25/04/2013" );
		
		if (localStorage.getItem("dateFrom") == null)
			$("#datepicker").datepicker( "setDate", "-" + searchInterval + "m" );
		else
			$("#datepicker").datepicker( "setDate", localStorage.getItem("dateFrom") );

		if (localStorage.getItem("dateTo") == null)
			$("#datepicker2").datepicker( "setDate", "now" );
		else
			$("#datepicker2").datepicker( "setDate", localStorage.getItem("dateTo") );
			
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
					localStorage.setItem("dateFrom", $("#datepicker").val());
					localStorage.setItem("dateTo", $("#datepicker2").val());
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
			localStorage.removeItem("dateFrom");
			localStorage.removeItem("dateTo");

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
			$("#plot_search").val("");
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
			alert ("Internet Explorer must be of version 9 and above");
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
					if ((this.nodeName == "manager" && $(this).attr("name") == userInfo[0].loginName) || userInfo[0].loginName == $(this).text()) {
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
						$(".customBody").removeClass("accessRejected");
						getActorsStatus();
						initTabs();
						getDocs();
						$(".customBody>div").show();
					} else {
						$(".customBody>div").hide();
						$(".customBody").addClass("accessRejected");
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
				selectJsonNodes();
			}
		});

		$("#customFlagUK").off("click").on("click", function(event){
			if ($("body[dir='rtl']").length) {
				toggleLanguage('en', 'ltr');
				selectJsonNodes();
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
	} else if (idp == "SAML") {
		//url = "get_user_attributes.php";
		contentType = "application/x-www-form-urlencoded; charset=UTF-8";
		//data = {loginNames:JSON.stringify(json)};
		
		url = "json_db_crud_pdo.php";
		data = {"func":"getUserAttributes",
			"param":{loginNames:JSON.stringify(json)}
		};
	} else {
		alert("Unknown user repository");
		return;
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
	
	//var status = actorSectionNumber;
	var secId = sectionId, empId = null;
	//if (rejected != undefined)
	if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.inprocess)		// in process
		secId = 123;
	else if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.vault)		// return
		secId = -20;
	else if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.edafat)	// edafat
		secId = 4;
	else if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.rejected)	// rejected
		secId = -10;

	if (sectionId != sectionId_enum.followup && actor == actor_enum.employee) {
		empId = userInfo[0].loginName;
	}
	
	return {
		//actorRole:actorSectionNumber,
		fileNumber: $("#file_number_search").val(),
		//paciNumber: $("#paci_number_search").val(),
		approver: selVal,
		dateFrom: dt,
		dateTo: dt2,
		//area: selVal2,
		area: $("#area_search").val(),
		block: $("#block_search").val(),
		plot: $("#plot_search").val(),
		sectionId: secId,
		employeeId: empId,
	};
}

function initTabs() {
//$(function() {
	if (!$("#tabs").hasClass("ui-tabs")) {
		$("#tab-edit").append($("#newForm"));
		$("#tab-users").append($("#userAssignmentDiv"));

		$("#tabs>ul>li").find('a[href="#tab-pending"]').text(jQuery.i18n.prop("PendingDocsListTab"));
		$("#tabs>ul>li").find('a[href="#tab-inprocess"]').text(jQuery.i18n.prop("InProcessDocsListTab"));
		$("#tabs>ul>li").find('a[href="#tab-vault"]').text(jQuery.i18n.prop("VaultDocsListTab"));
		$("#tabs>ul>li").find('a[href="#tab-rejected"]').text(jQuery.i18n.prop("RejectedDocsListTab"));
		$("#tabs>ul>li").find('a[href="#tab-edafat"]').text(jQuery.i18n.prop("EdafatTab"));
		$("#tabs>ul>li").find('a[href="#tab-edit"] span').text(jQuery.i18n.prop("CreateUpdateDocumentTab"));
		$("#tabs>ul>li").find('a[href="#tab-users"]').text(jQuery.i18n.prop("UserAssignmentTab"));
		
		if (!$("#custom_jsTree").hasClass("jstree"))
			userAssignment();
		
		$("#tabs").tabs({
			beforeActivate: function( event, ui ) {
				$("#addUserError").detach();
				//if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.pending) {
					if ($("#newForm").css("display") == "none") {
						//$("#tabs-9").append($("#newForm"));
						$("#newForm").show();
					}
					
					//resetForm();
					
					if ($("#userAssignmentDiv").css("display") == "none") {
						$("#userAssignmentDiv").show();
					}
				//}

				
/*
				if ( actor == actor_enum.employee && $("#tabs").tabs( "option", "active" ) == 0) {
					if ($("#newForm").css("display") == "none") {
						//$("#tabs-9").append($("#newForm"));
						$("#newForm").show();
					}
					resetForm();
				} else
				if ( actor == actor_enum.manager && $("#tabs").tabs( "option", "active" ) == 0 && $("#userAssignmentDiv").css("display") == "none") {
				//if ( actor == actor_enum.manager && $( "#tabs" ).tabs( "option", "active" ) == 0 && $("#userList").css("display") == "none") {
					//$("#tabs-9").append($("#userAssignmentDiv"));

					//$("#tabs-9").append($("#custom_jsTree"));
					//$("#tabs-9").append($("#userList"));
					//if (!$("#custom_jsTree").hasClass("jstree"))
					//	userAssignment();
					//else {
						$("#userAssignmentDiv").show();
						//$("#custom_jsTree").show();
						//$("#userList").show();
					//}
				}
*/				
			},

			activate: function( event, ui ) {
				//if (actor == actor_enum.manager && actorSectionNumber == 0) {
				//if (actor == actor_enum.manager) {
					if (ui.newTab.index() != activeTab_enum.edit && ui.newTab.index() != activeTab_enum.users)
						getDocs();
					else
						cleanDocTabs();

					//if (ui.newTab.index() == activeTab_enum.edit)
					//	resetForm();
						
					//if (ui.newTab.index() == 1 || ui.newTab.index() == 2 || ui.newTab.index() == 3)
					//	getDocs();
					//else if (ui.newTab.index() == 0 || ui.newTab.index() == 4)
					//	cleanDocTabs();
				//} else if (sectionId == sectionId_enum.followup && $("#tabs").tabs("option", "active") == 0) {
					//resetForm();
				//}
				
				if ($("#tabs").tabs("option", "active") == activeTab_enum.edit)
					resetForm();
			}
		});

	}

	$("#tabs").tabs( "enable", activeTab_enum.pending );
	$("#tabs").tabs( "option", "active", activeTab_enum.pending );

	$("#tabs").tabs( "disable", activeTab_enum.inprocess );
	$("#tabs>ul>li").find('a[href="#tab-inprocess"]').parent().hide();
	$("#tabs").tabs( "disable", activeTab_enum.vault );
	$("#tabs>ul>li").find('a[href="#tab-vault"]').parent().hide();
	$("#tabs").tabs( "disable", activeTab_enum.rejected );
	$("#tabs>ul>li").find('a[href="#tab-rejected"]').parent().hide();
	$("#tabs").tabs( "disable", activeTab_enum.edafat );
	$("#tabs>ul>li").find('a[href="#tab-edafat"]').parent().hide();
	$("#tabs").tabs( "disable", activeTab_enum.edit );
	$("#tabs>ul>li").find('a[href="#tab-edit"]').parent().hide();
	$("#tabs").tabs( "disable", activeTab_enum.users );
	$("#tabs>ul>li").find('a[href="#tab-users"]').parent().hide();
	
	switch (sectionId) {
		case sectionId_enum.followup:
			$("#tabs").tabs( "enable", activeTab_enum.edit );
			$("#tabs>ul>li").find('a[href="#tab-edit"]').parent().show();
			if (actor == actor_enum.manager) {
				$("#tabs").tabs( "enable", activeTab_enum.inprocess );
				$("#tabs>ul>li").find('a[href="#tab-inprocess"]').parent().show();
				$("#tabs").tabs( "enable", activeTab_enum.vault );
				$("#tabs>ul>li").find('a[href="#tab-vault"]').parent().show();
				$("#tabs").tabs( "enable", activeTab_enum.rejected );
				$("#tabs>ul>li").find('a[href="#tab-rejected"]').parent().show();
				$("#tabs").tabs( "enable", activeTab_enum.edafat );
				$("#tabs>ul>li").find('a[href="#tab-edafat"]').parent().show();
				$("#tabs").tabs( "enable", activeTab_enum.users );
				$("#tabs>ul>li").find('a[href="#tab-users"]').parent().show();
			}
			break;
		case sectionId_enum.ac:
		case sectionId_enum.electricity:
		case sectionId_enum.vault:
		case sectionId_enum.edafat:
			if (actor == actor_enum.manager) {
				$("#tabs").tabs( "enable", activeTab_enum.users );
				$("#tabs>ul>li").find('a[href="#tab-users"]').parent().show();
			}
			break;
		default:
			superuser.some(function(name) {
				if (userInfo[0].loginName == name) {
					$("#tabs").tabs( "enable", activeTab_enum.users );
					$("#tabs>ul>li").find('a[href="#tab-users"]').parent().show();
					return true;
				}
			})
	}
/*	
	if (actor == -1) {
		$("#tabs").tabs( "disable", 0 );
		$("#tabs").tabs( "disable", 1 );
	} else if (actor == actor_enum.employee && actorSectionNumber > 0) {
		$("#tabs").tabs( "disable", 4 );
	} else
		$("#tabs").tabs( "enable", 4 );

	if (actor == actor_enum.manager && actorSectionNumber == 0) {
		$("#tabs").tabs( "enable", 1 );
		$("#tabs>ul>li").find('a[href="#tabs-1"]').parent().show();
		$("#tabs").tabs( "enable", 2 );
		$("#tabs>ul>li").find('a[href="#tabs-2"]').parent().show();
		$("#tabs").tabs( "enable", 3 );
		$("#tabs>ul>li").find('a[href="#tabs-3"]').parent().show();
	} else {
		$("#tabs").tabs( "disable", 1 );
		$("#tabs>ul>li").find('a[href="#tabs-1"]').parent().hide();
		$("#tabs").tabs( "disable", 2 );
		$("#tabs>ul>li").find('a[href="#tabs-2"]').parent().hide();
		$("#tabs").tabs( "disable", 3 );
		$("#tabs>ul>li").find('a[href="#tabs-3"]').parent().hide();
	}
*/
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
	actor = -1, sectionId = null; //, actorSectionNumber = -1;
	if ((v = $(rootActors).find('manager[name="' + userInfo[0].loginName + '"]')).length != 0) {
		//$("#tabs>ul>li").find('a[href="#tabs-4"] span').text(jQuery.i18n.prop("UserAssignmentTab"));
		//actorSectionNumber = v.closest('section').index();		//a position of an actor's section to determine what records to show to approve
		sectionId =  v.closest('section').attr('id');		//an ID of an actor's section
		actor = actor_enum.manager;
		reportTo = v.closest('section').next().find('manager');		//reportTo[0].attributes[0].value
		//reportTo = v.closest('section').next().find('manager').attr('name');
	} else {
		$(rootActors).find('manager>employee').each(function(){
			//$("#tabs>ul>li").find('a[href="#tabs-4"] span').text(jQuery.i18n.prop("CreateUpdateDocumentTab"));
			if ($(this).text() == userInfo[0].loginName) {
				//actorSectionNumber = v.index();			//a position of an actor's section to determine what records to show to edit
				actor = actor_enum.employee;
				//v = $(this).closest('manager').attr('name');
				//actorSectionNumber = $(data).find('manager[name="' + v + '"]').index(); 	//a position of an actor's section to determine what records to show
				sectionId = $(this).closest('section').attr('id');		//an ID of an actor's section
				//actorSectionNumber = $(this).closest('section').index(); 				//a position of an actor's section to determine what records to show
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
					$("#custom_jsTree>ul>li").each(function(i) {
						if (sectionId == $(this).attr('id')) {
							$('#custom_jsTree').jstree("open_node", $("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")"));
							$("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")").show();
						} else
							$("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")").hide();
					})

					/*
					//jQuery.jstree._reference('#custom_jsTree').close_all($("#custom_jsTree"));
					var tree_size = $("#custom_jsTree>ul>li").length;
					for (var i = 0; i < tree_size; i++) {
						if (i == actorSectionNumber) {
							$('#custom_jsTree').jstree("open_node", $("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")"));
							$("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")").show();
						} else
							$("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")").hide();
					}
					*/
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
// ????????	if ((actorSectionNumber + 1) * 2 != i) 
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
					that.find('docPlot').text(),
					//that.find('docBuilding').text(),
					//that.find('docPACINumber').text(),
					sectionId
					//$(this).find('taskDescription').text(),
					//$(this).find('taskStatus').text()
					);
		//alert(name);
	});					
}	

function cleanDocTabs() {
	$("#docs").empty();
	$("#inProcessDocs").empty();
	$("#vaultDocs").empty();
	$("#rejectedDocs").empty();
	$("#edafatDocs").empty();
}

function selectJsonNodes() {
	//var docListSelector = $("#docs");
	var docListSelector;
	
	//var rejected = false;
	//if ($("#tabs").hasClass("ui-tabs") && $("#tabs").tabs( "option", "active" ) == 3) {
	//if (rejected != undefined)
		//rejected = true;
	//	docListSelector = $("#rejectedDocs");
	//}

	cleanDocTabs();
	
	if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.pending) 		// pending
		docListSelector = $("#docs");
	else if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.edit)		// update form
		docListSelector = $("#docs");
	else if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.inprocess)	// in process
		docListSelector = $("#inProcessDocs");
	else if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.vault)		// return
		docListSelector = $("#vaultDocs");
	else if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.rejected)	// rejected
		docListSelector = $("#rejectedDocs");
	else if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.edafat)	// edafat
		docListSelector = $("#edafatDocs");
	
	//cleanDocTabs();
	//docListSelector.empty();

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
						key.doc.docPlot,
						//key.doc.docBuilding,
						//key.doc.docPACINumber,
						key.doc.sectionId,
						key.doc.employeeId
						//$(this).find('taskDescription').text(),
						//$(this).find('taskStatus').text()
						);
		}
		//alert(name);
	});					
}	

//$('.customMiddleSide>ul').empty();

//function addDocToList(list, id, file_number, date, name, area, block, street, building, paci_number, secId, empId) {
function addDocToList(list, id, file_number, date, name, area, block, plot, secId, empId) {
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
					$.i18n.prop('Plot') + ": " + plot;
//					+ "; " + 
//					$.i18n.prop('Building') + ": " + building;

	itemTemplate.find('.docAddress span').text(address);
	//itemTemplate.find('.docAddress').text(address);

	//itemTemplate.find('.docPACINumber span').text(paci_number);
	
	// Set the description to the task description
	//itemTemplate.find('.taskDescription span').html(description);

	itemTemplate.data('secId', secId);
	itemTemplate.data('empId', empId);
	
	//checkStatus(itemTemplate, selectTag.children().length);
	applyButtonBorderStyle(itemTemplate);

	// Add Doc Element created from template
	list.append(itemTemplate);
}

//function checkStatus(itemTemplate, li_count) {
//function checkStatus(itemTemplate) {
function applyButtonBorderStyle(itemTemplate) {

	//var button_images = $(itemTemplate).find("a img");
	//var button_images = $(itemTemplate).find("a");

	itemTemplate.removeClass();
	//$($(button_images)[0]).css("display", "none");	//reject button
	//$($(button_images)[1]).css("display", "none");		//approve button
	//$($(button_images)[2]).css("display", "none");		//edit button

	if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.inprocess) {	// in process
		//if (itemTemplate.find('.docDetailDiv select').children().length == 2)
		if (itemTemplate.data('secId') == 1)
			itemTemplate.addClass("goldBorder");
		//else if (itemTemplate.find('.docDetailDiv select').children().length == 3)
		else if (itemTemplate.data('secId') == 2)
			itemTemplate.addClass("blueBorder");
		else if (itemTemplate.data('secId') == 3)
			itemTemplate.addClass("greenBorder");
		

		//i = key.doc.docHistory.length;  			// the value is always a multiple of 2 
			//if ((actorSectionNumber + 1) * 2 != i * 2) 
			//	return true;	//java's "continue" operation for javascript's "each" command
	}
	
/*
	switch (sectionId) {
		case sectionId_enum.followup:
			if (actor == actor_enum.manager) {
				if ($("#tabs").tabs( "option", "active" ) != 0)
				{
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
				}
			} else if (actor == actor_enum.employee) {
				itemTemplate.find("a:nth-of-type(3)").addClass("editButton");			//edit button
				itemTemplate.find("a:nth-of-type(1)").addClass("rejectButton");			//reject button
			}
			break;
		case sectionId_enum.ac:
			break;
		case sectionId_enum.electricity:
			break;
		case sectionId_enum.checkup:
			break;
		default:
	}
*/
	
	
	
	
	
	//if (actor == actor_enum.employee && actorSectionNumber == 0) {
	if (actor == actor_enum.employee) {
		if (sectionId == sectionId_enum.followup) {
			itemTemplate.find("a:nth-of-type(2)").addClass("editButton");
			itemTemplate.find("a:nth-of-type(2)").attr('title', $.i18n.prop('Edit'));
			itemTemplate.find(".docDetailDiv>a:nth-of-type(1)").addClass("rejectButton");
			itemTemplate.find(".docDetailDiv>a:nth-of-type(1)").attr('title', $.i18n.prop('Reject'));
		} else if (sectionId == sectionId_enum.ac || sectionId == sectionId_enum.electricity) {
			itemTemplate.find("a:nth-of-type(2)").addClass("approveButton");
			itemTemplate.find("a:nth-of-type(2)").attr('title', $.i18n.prop('Approve'));
			itemTemplate.find(".docDetailDiv>a:nth-of-type(1)").addClass("rejectButton");
			itemTemplate.find(".docDetailDiv>a:nth-of-type(1)").attr('title', $.i18n.prop('Reject'));
		}
	} else {
		if (actor == actor_enum.manager) {
			if (sectionId == sectionId_enum.followup) {
				if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.pending) {					//pending
					itemTemplate.find(".docDetailDiv>a:nth-of-type(1)").addClass("rejectButton");
					itemTemplate.find(".docDetailDiv>a:nth-of-type(1)").attr('title', $.i18n.prop('Delete'));
					itemTemplate.find("a:nth-of-type(2)").addClass("editButton");
					itemTemplate.find("a:nth-of-type(2)").attr('title', $.i18n.prop('Edit'));
					itemTemplate.find("a:nth-of-type(3)").addClass("approveButton");
					itemTemplate.find("a:nth-of-type(3)").attr('title', $.i18n.prop('Approve'));
				} else if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.rejected) {			//rejected
					itemTemplate.find(".docDetailDiv>a:nth-of-type(1)").addClass("rejectButton");
					itemTemplate.find(".docDetailDiv>a:nth-of-type(1)").attr('title', $.i18n.prop('Delete'));
					itemTemplate.find("a:nth-of-type(2)").addClass("editButton");
					itemTemplate.find("a:nth-of-type(2)").attr('title', $.i18n.prop('Edit'));
					itemTemplate.find("a:nth-of-type(3)").addClass("forwardbackButton");
					itemTemplate.find("a:nth-of-type(3)").attr('title', $.i18n.prop('ForwardBack'));
				} else if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.inprocess) {
					if (itemTemplate.data('empId') != null) {
						//itemTemplate.find("a:nth-of-type(4)").addClass("revokeButton");				//revoke button
						itemTemplate.find(".tagButton").text(mapLoginNameToDisplayName(itemTemplate, itemTemplate.data('empId')));
						itemTemplate.find(".tagButton").css("position", "absolute"); 	// CSS works in IE, but not in FF, Chrome; for FF, Chrome set .css("position", "absolute");

						itemTemplate.find(".tagButton").css("display", "block");
						itemTemplate.find(".tagButton").button({ icons: { primary: 'ui-icon-person'} });
						//itemTemplate.find("a:nth-of-type(1)").button({ disabled: 'true' });

						if ($("body[dir='ltr']").length)
							itemTemplate.find(".tagButton").css({ right: '2px' });
						else
							itemTemplate.find(".tagButton").css({ left: '2px' });

						itemTemplate.find(".tagButton").css({ bottom: '6px' });
						itemTemplate.find(".tagButton>span:nth-of-type(2)").css({ 'padding-top': '0px', 'padding-bottom': '0px' });
						//itemTemplate.find(".tagButton>span:nth-of-type(2)").css({ 'padding-top': '0px' });
						//itemTemplate.find(".tagButton>span:nth-of-type(2)").css({ 'padding-bottom': '0px' });
						//itemTemplate.find("div>a").css({ color: 'black' });
					}
					
					setPrintCommentLinks(itemTemplate);
					
				} else if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.vault) {
					setPrintCommentLinks(itemTemplate);
				} else if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.edafat) {
					setPrintCommentLinks(itemTemplate);
				}
			} else if (sectionId == sectionId_enum.checkup) {
				itemTemplate.find(".tagButton").addClass("checkupButton");	
				itemTemplate.find(".tagButton").text("Checkup");
				itemTemplate.find(".tagButton").css("position", "absolute"); 	// CSS works in IE, but not in FF, Chrome; for FF, Chrome set .css("position", "absolute");
				itemTemplate.find(".tagButton").css("display", "block");

				if ($("body[dir='ltr']").length)
					itemTemplate.find(".tagButton").css({ right: '2px' });
				else
					itemTemplate.find(".tagButton").css({ left: '2px' });
				
				itemTemplate.find(".tagButton").button({ icons: { primary: 'ui-icon-document'} });
			} else if (sectionId == sectionId_enum.ac || sectionId == sectionId_enum.electricity) {
				if (itemTemplate.data('empId') != null) {
					itemTemplate.find(".tagButton").addClass("revokeButton");	
					itemTemplate.find(".tagButton").text(mapLoginNameToDisplayName(itemTemplate, itemTemplate.data('empId')));

					itemTemplate.find(".tagButton").css("position", "absolute"); 	// CSS works in IE, but not in FF, Chrome; for FF, Chrome set .css("position", "absolute");
					//itemTemplate.find(".tagButton").css(itemTemplate.offset());						 

					itemTemplate.find(".tagButton").attr('title', $.i18n.prop('Revoke'));
					
					if ($("body[dir='ltr']").length)
						itemTemplate.find(".tagButton").css({ right: '2px' });
					else
						itemTemplate.find(".tagButton").css({ left: '2px' });
					
					//itemTemplate.find(".tagButton").parent().css({ right: '4px' });
					itemTemplate.find(".tagButton").css("display", "block");
					itemTemplate.find(".tagButton").button({ icons: { primary: 'ui-icon-arrowreturnthick-1-s'} });
				} else {
					itemTemplate.find(".docDetailDiv>a:nth-of-type(1)").addClass("forwardButton");
					itemTemplate.find(".docDetailDiv>a:nth-of-type(1)").attr('title', $.i18n.prop('Forward'));
				}
			}
		}
	}
}

function setPrintCommentLinks(itemTemplate) {
	var a_tag, a2_tag;
	if ($("body[dir='ltr']").length) {
		a_tag = $('<a href="#" class="docPrintAnchor floatRight">' + jQuery.i18n.prop('Print') + '</a>');
		a2_tag = $('<a href="#" class="docCommentAnchor floatRight">' + jQuery.i18n.prop('Comment') + '</a>');
	} else {
		a_tag = $('<a href="#" class="docPrintAnchor floatLeft">' + jQuery.i18n.prop('Print') + '</a>');
		a2_tag = $('<a href="#" class="docCommentAnchor floatLeft">' + jQuery.i18n.prop('Comment') + '</a>');
	}
	
	itemTemplate.find(".docDetailDiv").prepend(a2_tag);
	itemTemplate.find(".docDetailDiv").prepend(a_tag);
}

function mapLoginNameToDisplayName(itemTemplate, loginName) {
	var displayName;
	userInfo.some(function(o) {
		displayName = o.displayName;
		if (loginName == o.loginName)
			return true;
	})

	return displayName;
}

$(document).on("click", ".revokeButton", function(e, data) {
	//if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.inprocess) {
	//	e.preventDefault();
	//	e.stopPropagation();
	//	return;
	//}
	
	var fn = $(this).closest("div").find(".docFileNumber span").text();
	revoke(fn);
})

$(document).on("click", ".checkupButton", function() {
	checkupFormDialog(this);
})

$(document).on("click", ".approveButton", function() {
	commentDialog(this, status_enum.approve);
})

$(document).on("click", ".forwardButton", function() {
	commentDialog(this, status_enum.approve);
})

$(document).on("click", ".forwardbackButton", function() {
	commentDialog(this, status_enum.approve);
})

$(document).on("click", ".rejectButton", function(e, data) {
	//if (actor == actor_enum.employee && actorSectionNumber == 0) {
	//if (actor == actor_enum.employee && sectionId == sectionId_enum.followup) {
	if (sectionId == sectionId_enum.followup) {
		e.stopImmediatePropagation();
	
		//if (!confirm("Are you sure?")) {
		if (!confirm(jQuery.i18n.prop('AreYouSure'))) {
			//e.stopImmediatePropagation();
			return false;
		}

		var fileNumber = $(this).parent().find(".docFileNumber span").text();
		//$(this).parent().remove();
		deleteDocument(fileNumber);
	} else 
		commentDialog(this, status_enum.reject);
})

function deleteDocument(fileNumber) {
	var url, data, deleteIfExists = 0;
	if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.rejected)	// rejected
		deleteIfExists = 1;
	
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
				deleteIfExists: deleteIfExists,
			}};
		//dataType = "json";
	}

	$.post(url, data)
		.done(function(data){
			if (data && data.constructor == Array) {
				if (data[0].error != undefined) {
					if (data[0].error == "1003")
						alert(($.i18n.prop("ApprovedCannotBeDeleted")).format(fileNumber));
					else
						alert(data[0].error);
				}
			} else {
				var keyToDelete = null;
				rootDoc[0].docs.some(function(key, index) {
					if (key.doc.docFileNumber == fileNumber) {
						//rootDoc[0].docs[index] = null;
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

function checkupFormDialog(that) {
//this.checkupFormDialog = function(that) {
	var fileNumber = $(that).closest("div").find(".docFileNumber span").text();
/*
	var sectionIdReturnedFrom;
	rootDoc[0].docs.some(function(key, index) {
		if (key.doc.docFileNumber == docFileNumber) {
			return true;
		}
	});
*/
	//alert(docFileNumber);
	//$("#checkupForm").show();
	
	var form = $("#checkupForm");
    form.prop('fileNumber', fileNumber);
    form.dialog({
		title:jQuery.i18n.prop('FileNumber') + ": " + fileNumber,
		//dialogClass: "no-close",
        height: "auto",
        width: 730,
        modal: true,
		autoOpen: true,
		resizable: false,
		closeOnEscape: false,
		open: function( event, ui ) {
			$(this).dialog( "option", "buttons",
				[{	text: "Save",
					id: "buttSave",
					click: function() {
						$( this ).dialog( "destroy" )
					}
				},
				{	text: "Cancel",
					click: function() {
						$( this ).dialog( "destroy" )
					}
				}]
			); 

			$(this).find("#file_number_checkup").val(fileNumber);
			//$(this).find("#file_number_checkup").prop("disabled", "true");

			that = $(that).parent();	//  a context of the current doc

			var address = that.find('.docAddress span').text();
			$(this).find("#address").val(address);
			//$(this).find("#address").prop("disabled", "true");

/*
			form.find("#area").val(address[0].trim());
			var v = address[1].split(':');
			form.find("#block").val(v[1].trim());
			v = address[2].split(':');
			form.find("#plot").val(v[1].trim());
*/

			$('input[id="date_submission"]').change(function() {
				var regExpPattern = /^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)\d\d$/;
				if (!$(this).val().match(regExpPattern)) {
					$(this).addClass( "ui-state-error" );
					$("#buttSave").attr('disabled', 'disabled');
				} else {
					$(this).removeClass( "ui-state-error" );
					$("#buttSave").removeAttr("disabled");
				}
			});
			
			//ui-dialog-buttonset
			$(this).parent().find(".ui-button-text").each(function() {
				var that = $(this);
				if (that.text() == "Save")
					that.text(jQuery.i18n.prop('Save'));
				else if (that.text() == "Cancel")
					that.text(jQuery.i18n.prop('Cancel'));
				else if (that.text() == "Close")
					that.text(jQuery.i18n.prop('Close'));
			});
			
		},
		close: function( event, ui ) {
		},
    });
};

this.commentDialog = function(that, action) {
    //$("#commentDialog").dialog( "destroy" );
	var fileNumber = $(that).closest("div").find(".docFileNumber span").text();

	var commentHistory = "";
	var sectionIdReturnedFrom;
	rootDoc[0].docs.some(function(key, index) {
		if (key.doc.docFileNumber == fileNumber) {
			//docFileNumber = key.doc.docFileNumber;
			//currentDoc = key.doc;
			sectionIdDocReturnedFrom = Math.abs(key.doc.sectionId % 10);
			commentHistory = key.doc.docComment == null ? '' : key.doc.docComment;
			return true;
		}
	});
	
	var html = "<div>";
	
	//var html = '<div style="overflow:auto; height: 340px; word-wrap:break-word;">' + docFileNumber.siblings('docComment').text() + "</div><br/>";
	html += '<div style="overflow:auto; height: 340px; word-wrap:break-word;">' + commentHistory + "</div><br/>";

	if (action != status_enum.readonly) {
	
     	if (action == status_enum.approve) {
			html += '<fieldset><legend>' + jQuery.i18n.prop('ForwardTo') + '</legend><div id="radio">';
			//html += '<fieldset><legend>' + jQuery.i18n.prop('ForwardTo') + '</legend>';
			
			var  checked = "", nf = {};	// names to forward - the names of sections or employees to forward a document
			if (sectionId != sectionId_enum.followup && actor == actor_enum.manager) {
				var employee = null;
				$(rootActors).find('section[id="' + sectionId + '"] employee').each(function(index) {

					nf.checked = "";
					if (checked.length == 0) {
						if ($($(this).parent()).children().length == 1)
							checked = nf.checked = " checked=\"checked\"";
					}

					employee = $(this).text();
					userInfo.some(function(o) {
						if (employee == o.loginName) {
							html += '<input type="radio" id="radio' + employee + '" value="' + employee + '" name="radio"' + nf.checked + ' /><label for="radio' + employee + '">' + o.displayName + '</label>';
							//html += '<input type="radio" id="radio' + index + '" name="radio" /><label for="radio' + index + '">' + o.displayName + '</label>';
							return true;
						}
					})
				})
			} else if (sectionId == sectionId_enum.followup && $("#tabs").tabs( "option", "active" ) == activeTab_enum.rejected) {
				//var fn = $(that).closest("div").find(".docFileNumber span").text();
				//var doc = $(rootDoc).find("doc>docFileNumber:contains('" + fn + "')");

				var sec = $(rootActors).find('section[id="' + sectionIdDocReturnedFrom + '"]');
				var name = ($("body[dir='ltr']").length) ? sec.attr('name') : sec.attr('arName');
				html += '<input type="radio" id="radio1" value="' + sectionIdDocReturnedFrom + '" name="radio" checked="checked" /><label for="radio1">' + name + '</label>';
				
			} else {
				$(rootActors).find('section').each(function(index) {
					//if (index == 0) 
					//	return true;	// continue

					//nf.disabled = sectionId == $(this).attr('id') ? " disabled=\"disabled\"" : "";
					
					
					if (sectionId == $(this).attr('id'))
						return true;
						
					nf.name = ($("body[dir='ltr']").length) ? $(this).attr('name') : $(this).attr('arName');

					nf.checked = "";
					if (checked.length == 0) {
						if ($($(this).parent()).children().length == 1)
							checked = nf.checked = " checked=\"checked\"";
					}
						
					html += '<input type="radio" id="radio' + index + '" value="' + $(this).attr('id') + '" name="radio"' + nf.checked + ' /><label for="radio' + index + '">' + nf.name + '</label>';
					//html += '<input type="radio" id="radio' + index + '" value="' + $(this).attr('id') + '" name="radio"' + nf.disabled + nf.checked + ' /><label for="radio' + index + '">' + nf.name + '</label>';
				})
			}
			
			html += '</div></fieldset>';
		}
		
		if (!(sectionId != sectionId_enum.followup && actor == actor_enum.manager))
			html += '<textarea name="comment" id="comment" style="width:500px;" rows="4" class="text ui-widget-content ui-corner-all" ></textarea>';
			
		html += '</div>';
			
	}

	//var form = $("#dialog-form-comments");
	var form = $("<div/>");
    form.html(html);
    form.prop('commentHistory', commentHistory);
    form.prop('fileNumber', fileNumber);
    form.dialog({
		title:jQuery.i18n.prop('FileNumber') + ": " + fileNumber,
        //title:jQuery.i18n.prop('Comment'),
		//dialogClass: "no-close",
        height: "auto", //640,
        width: 600,
        modal: true,
		autoOpen: true,
		resizable: false,
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
			$("#radio").buttonset();
			$("#comment").focus();
			//this.firstChild.scrollTop = this.firstChild.scrollHeight;
			//$('input:radio[name=radiogroup]:nth(' + (checked_idx - 1) + ')').prop('checked',true);
			//$('input:radio[name=radio]')[checked_idx - 1].checked = true;				
			//$("#radiogroup").buttonset("refresh");

			if (action == status_enum.readonly) {
				//$("#dialog-form-comments" ).dialog( "option", "buttons",
				$(this).dialog( "option", "buttons",
					[{	text: "Close",
						click: function() {
							$( this ).dialog( "destroy" );
						}
					}]
				); 
			} else {
				//$("#dialog-form-comments" ).dialog( "option", "buttons",
				$(this).dialog( "option", "buttons",
					[{
						text: "Ok",
						id: "buttOk",
						click: function() {
							if (action == status_enum.approve) {
								//$(e.currentTarget).button('disable');
								// get DOM element for button
								//var buttonDomElement = e.target;
								//$(buttonDomElement).attr('disabled', true);
								approve($(this).find("#comment").val(), this.commentHistory, this.fileNumber, $("input:checked").val());
								//$("input[name='radio']:checked").val()
							} else if (action == status_enum.reject)
								reject($(this).find("#comment").val(), this.commentHistory, this.fileNumber);
								
							$( this ).dialog( "destroy" );
						}
					},
					{	text: "Cancel",
						click: function() {
							$(this).dialog( "destroy" );
						}
					}]
				);
			}

			$('#radio').bind('click', function(event){
				if ($("input:checked").val() != undefined)
					$("#buttOk").prop('disabled', false);
					//$(".ui-dialog-buttonpane").find('button:contains("Ok")').prop('disabled', false);	// it works !!!!
			});

			if (action == status_enum.approve && $("input:checked").val() == undefined)
				$(this).dialog('widget').find('button:contains("Ok")').prop('disabled', true);
			 
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

function approve(currentComment, commentHistory, fileNumber, forwardTo) {
	approve_reject_revoke(currentComment, commentHistory, fileNumber, forwardTo, status_enum.approve)
}

function reject(currentComment, commentHistory, fileNumber) {
	approve_reject_revoke(currentComment, commentHistory, fileNumber, null, status_enum.reject)
}

function revoke(fileNumber) {
	approve_reject_revoke(null, null, fileNumber, null, status_enum.revoke)
}

function approve_reject_revoke(currentComment, commentHistory, docFileNumber, forwardTo, status) {
	//var currentComment = "";
/*	
	if (status != status_enum.revoke) {
		var obj = $("#dialog-form-comments");
		if (obj && obj.dialog( "isOpen" )) {
			currentComment = obj.find('#comment').val();
			obj.dialog('close');
		//	alert(comment);
		}
	}
*/	
	var dt = getDate();
	var signature = dt + ' ' + userInfo[0].displayName;
	var html = commentHistory == null ? '' : commentHistory;
		
	if (status == status_enum.approve)
		html += '<span class="ca">';
	else
		html += '<span class="cr">';

	html += signature + "</span><br/>" + currentComment + "<br/>";

	var docComment = html;
	//}
	
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

	//var status = actorSectionNumber + 1;
	//var status = parseInt(sectionId) + 1;
	var secId;
	var docHistory = {"docDate": dt, "docApprover": userInfo[0].displayName};

	if (status == status_enum.revoke) {					//revoke
		secId = null;
		forwardTo = null;
	} else if (status == status_enum.reject) {			//reject
		secId = -10 - parseInt(sectionId);				
		//forwardTo = null;
	} else if (sectionId != sectionId_enum.followup && actor == actor_enum.manager) { // assign doc to employee
		secId = null;
		// forwardTo should have a value	!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		docHistory = null;
		docComment = null;
	} else if (sectionId != sectionId_enum.followup && actor == actor_enum.employee) {
		if (forwardTo == sectionId_enum.followup) {  //return back to Follow up section
			secId = -20 - parseInt(sectionId);
			// forwardTo = null;
		} else {  //forward to ac, electricity, checkup sections
			secId = parseInt(forwardTo);
		}
	} else {
		secId = parseInt(forwardTo);
		// forwardTo = null;
	}
	
	var url, data;
	if (documentSource == "XML") {
		url = "xml-write.php";
		data = {'fileName': 'docs.xml', 'xml' : $.xml(rootDoc)};
		//dataType = "text";
	} else {
		url = "json_db_crud_pdo.php";
		data = {"func":"approve_reject",
			"param":{
				docFileNumber: docFileNumber,
				docHistory: docHistory,
				docComment: docComment,
				sectionId: secId,
				employeeId: forwardTo,
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
						//rootDoc[0].docs[index] = null;
						
						switch (status) {
							case status_enum.approve:
								if (secId == null) {
									key.doc.employeeId = forwardTo;
									break;
								}
							case status_enum.reject:
								delete rootDoc[0].docs[index];
								rootDoc[0].docs.splice(index, 1);
								break;
							default:
								key.doc.employeeId = forwardTo;
						}
						
						/*
						if (status == status_enum.approve || status == status_enum.reject) {
							delete rootDoc[0].docs[index];
							rootDoc[0].docs.splice(index, 1);
						} else
							key.doc.employeeId = forwardTo;
						*/	
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

function appendAttributeToElement(el, attrName, attrValue) {
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
		plot = $( "#plot" ),
		//building = $( "#building" ),
		//paci_number = $( "#paci_number" ),
		title = $( "#title" ),
		allFields = $( [] ).add(file_number).add(area).add(block).add(plot).add(title),
		//allFields = $( [] ).add(file_number).add(area).add(block).add(street).add(building).add(paci_number).add(title),
		tips = $( "#validateTips" );

	if ($("#newForm").length != 0) {
		$("#newForm form")[0].reset();
		$("#newForm #file_number").removeAttr("readonly");
		$('#validateTips').html(jQuery.i18n.prop('ValidateTips'));
		allFields.removeClass( "ui-state-error" );
	}

	$("#newForm").data('originFileNumber', null);
	file_number.focus();
	//$("#newForm").find("#file_number").focus();
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

		var found = false;
		userInfo.some(function(o) {
			if (obj.val() == o.loginName) {
		//html = ('<option {0} disabled="disabled" value="' + i + '">' + nam + '</option>').format((i + 1 == $(date).length) ? 'selected="selected"' : '');
			
				//$(".customMiddleSide").append('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">The user ' + obj.val() + ' already exists</div>');
				//$(".customMiddleSide").append(('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">The user {0} already exists</div>').format(obj.val()));
				$(".customMiddleSide").append('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">' + (jQuery.i18n.prop("UserExists")).format(obj.val()) + '</div>');
				
				obj.val("");
				found = true;
				return true;
			}
		});
		
		if (found)
			return;
		
		getUserIdentities("GetUserInfo",  [{loginName: obj.val()}], function () {
			var index = userInfo.length;
			if (userInfo[index - 1].loginName == userInfo[index - 1].displayName) {
				//$(".customMiddleSide").append('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">The user ' + obj.val() + ' does not exist</div>');
				//$(".customMiddleSide").append(('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">The user {0} does not exist</div>').format(obj.val()));
				$(".customMiddleSide").append('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">' + (jQuery.i18n.prop("UserDoesNotExist")).format(obj.val()) + '</div>');
				userInfo.splice(index - 1, 1);
				obj.val("");
				found = true;
				return false;			// ???????
			}

			if (found)
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
		var newDoc = saveForm(this);
		if (!newDoc) {
		//if ($("#newForm").is(':visible')) {
			$("#newForm").dialog('close');	//close is just to activate a "close" event
			$("#newForm").dialog('destroy');
		}
	});
	
	$(document).on("click", "#cancelButton", function(){
		//if ($("#newForm").is(':visible')) {
			$("#newForm").dialog('close');	//close is just to activate a "close" event
			$("#newForm").dialog('destroy');
		//}
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
		//$( "#tabs" ).tabs( "option", "active", activeTab_enum.edit );
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
		plot = $( "#plot" ),
		//building = $( "#building" ),
		//paci_number = $( "#paci_number" ),
		title = $( "#title" ),
		allFields = $( [] ).add(file_number).add(area).add(block).add(plot).add(title),
		//allFields = $( [] ).add(file_number).add(area).add(block).add(street).add(building).add(paci_number).add(title),
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
		form.data('originFileNumber', fn);
		//form.find("#file_number").attr('readonly','readonly');

		var address = that.find('.docAddress span').text().split(';');
		form.find("#area").val(address[0].trim());
		var v = address[1].split(':');
		form.find("#block").val(v[1].trim());
		v = address[2].split(':');
		form.find("#plot").val(v[1].trim());
		//v = address[3].split(':');
		//form.find("#building").val(v[1].trim());

		//form.find("#paci_number").val(that.find('.docPACINumber span').text());
		
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

		form.dialog({
			title:jQuery.i18n.prop('FileNumber') + ": " + fn,
			dialogClass: "no-close",
			height: "auto", //640,
			width: 600,
			modal: true,
			autoOpen: true,
			resizable: false,
			closeOnEscape: false,
			open: function( event, ui ) {
				$(this).find('#cancelButton').show()
			},
			close: function( event, ui ) {
				$(this).find('#cancelButton').hide();
			},
		});
	}
	
	function saveForm(that) {
		var bValid = true;
		allFields.removeClass( "ui-state-error" );
		//bValid = bValid && checkLength( file_number, "File Number", 5, 5 );
		//bValid = bValid && checkLength( file_number, $.i18n.prop("FileNumber"), 5, 5 );
		//bValid = bValid && checkRegexp( file_number, /^([0-9])+$/, "File Number field only allows : 0-9" );
		bValid = bValid && isRequired( file_number, $.i18n.prop("FileNumber") );
		bValid = bValid && checkRegexp( file_number, /^[^:;]+$/, ($.i18n.prop("FieldOnlyAllows")).format($.i18n.prop("FileNumber"), " : 0-9")); //File Number field only allows : 0-9" 
		
		//bValid = bValid && isRequired( area, "Area" );
		//bValid = bValid && checkRegexp( area, /^[^:;]+$/, "Area field does not allow ':' ';'" );
		bValid = bValid && isRequired( area, $.i18n.prop("Area") );
		bValid = bValid && checkRegexp( area, /^[^:;]+$/, ($.i18n.prop("FieldOnlyAllows")).format($.i18n.prop("Area"), " ':' ';'"));

		//bValid = bValid && isRequired( block, "Block" );
		//bValid = bValid && checkRegexp( block, /^[^:;]+$/, "Block field does not allow ':' ';'" );
		bValid = bValid && isRequired( block, $.i18n.prop("Block") );
		bValid = bValid && checkRegexp( block, /^[^:;]+$/, ($.i18n.prop("FieldOnlyAllows")).format($.i18n.prop("Block"), " ':' ';'"));

		//bValid = bValid && isRequired( street, $.i18n.prop("Street") );
		//bValid = bValid && checkRegexp( street, /^[^:;]+$/, ($.i18n.prop("FieldOnlyAllows")).format($.i18n.prop("Street"), " ':' ';'"));
		//bValid = bValid && isRequired( plot, $.i18n.prop("Plot") );
		bValid = bValid && checkRegexp( plot, /^[^:;]+$/, ($.i18n.prop("FieldOnlyAllows")).format($.i18n.prop("Plot"), " ':' ';'"));

		//bValid = bValid && isRequired( building, $.i18n.prop("Building") );
		//bValid = bValid && checkRegexp( building, /^[^:;]+$/, ($.i18n.prop("FieldOnlyAllows")).format($.i18n.prop("Building"), " ':' ';'"));
		
		////bValid = bValid && checkRegexp( paci_number, /^([0-9]){8}$/, "PACI Number field only allows : 0-9 , length is 8" );
		//bValid = bValid && checkRegexp( paci_number, /^([0-9]){8}$/, ($.i18n.prop("FieldOnlyAllows")).format($.i18n.prop("PACINumber"), $.i18n.prop("LengthIs8")));
		
		//bValid = bValid && isRequired( title, "Title" );
		bValid = bValid && isRequired( title, $.i18n.prop("Title") );

		/*
		bValid = bValid && checkRegexp( name, /^[a-z]([0-9a-z_])+$/i, "User name may consist of a-z, 0-9, underscores, begin with a letter." );
		// From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
		bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "Wrong e-mail address." );
		bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
		*/
		//var form = $(that.form);							// form context
		//var file_number_val = form.find("#file_number").val();
		//var area_val = form.find("#area").val();
		//var block_val = form.find("#block").val();
		//var street_val = form.find("#street").val();
		//var building_val = form.find("#building").val();
		//var paci_number_val = form.find("#paci_number").val();
		//var title_val = form.find("#title").val();
		if ( bValid ) {

			//var docNode, newDoc = true;
			var docNode;
			var newDoc = $("#newForm").data('originFileNumber') == null;
			var fileNumber;

			if (rootDoc.constructor == XMLDocument) {
				docNode = $(rootDoc).find("doc>docFileNumber:contains('" + file_number.val() + "')");
				//newDoc = (docNode.length == 0);
			} else {
				if (newDoc)
					fileNumber = file_number.val();
				else
					fileNumber = $("#newForm").data('originFileNumber');
				
				if (rootDoc[0].docs == undefined)
					rootDoc[0].docs = [];

				rootDoc[0].docs.some(function(key, index) {
					if (key.doc.docFileNumber == fileNumber) {
					//if (key.doc.docFileNumber == file_number.val()) {
						//docFileNumber = key.doc.docFileNumber;
						docNode = key.doc;
						//newDoc = false;
						return true;
					}
				});
			}
		
			var url, data, udateIfExists = 0;
			if ($("#tabs").tabs( "option", "active" ) == activeTab_enum.rejected)	// rejected
				udateIfExists = 1;
			
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
						docPlot:plot.val(),
						//docBuilding: building.val(),
						//docPACINumber:paci_number.val(),
						docTitle:title.val(),
						originFileNumber: (newDoc) ? null : $("#newForm").data('originFileNumber'),
						udateIfExists: udateIfExists,
					}};
				//dataType = "json";
			}

			var errorFound = false;
			$.post(url, data)
			.done(function(data){
				//if (data.error) {
				//	alert("Data: " + data + "\nStatus: " + status);
				//}
				if (data && data.constructor == Array) {
					if (data[0].error != undefined) {
						errorFound = true;
						if (data[0].error == "1003")
							alert(($.i18n.prop("ApprovedCannotBeModified")).format(file_number.val()));
						else if (data[0].error == "23000")
							alert(($.i18n.prop("AlreadyExists")).format(file_number.val()));
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
								errorFound = true;
								alert("Data: " + data + "\nStatus: " + status);
							}
						}, "text");
					}
				}
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				errorFound = true;
				alert("saveDocs - error: " + errorThrown);
			})
			.always(function() {
			});
			
			if (errorFound) {
				return newDoc;
			}
			
			//var xmlNode = $(rootDoc).find("doc>docFileNumber:contains('" + file_number.val() + "')");
			if (!newDoc) {
				//var itemList = $("#newForm").data("currentItem");			// current doc context

				var item = $('#docs').find(".docFileNumber:contains('" + file_number.val() + "')").parent();
				/*
				//if (udateIfExists == 0) {
					var selTag = item.find('select');
					//xmlNode.find("docHistory>docApprover").text();
					//var nam = 'Submitted ' + getDate() + ' by ' + userInfo[0].displayName;
					var nam = getDate() + ' ' + userInfo[0].displayName;
					var html = '<option selected="selected" disabled="disabled" value="0">' + nam + '</option>';
					selTag.children("option").remove();
					selTag.append(html);
				//}
				*/
				var address = area.val() + "; " + 
						$.i18n.prop('Block') + ": " + block.val() + "; " + 
						$.i18n.prop('Plot') + ": " + plot.val();
//						+ "; " + 
//						$.i18n.prop('Building') + ": " + building.val();
				item.find(".docAddress span").text(address);
				
				//item.find(".docPACINumber span").text(paci_number.val());
			
				if (rootDoc.constructor == XMLDocument) {
					docNode = docNode.parent();
					//xmlNode.find("docHistory>docApprover").text(userInfo[0].loginName);
					docNode.children("docFileNumber").text(file_number.val());
					if (udateIfExists == 0) {
						docNode.find("docHistory>docDate").text(getDate());
						docNode.find("docHistory>docApprover").text(userInfo[0].displayName);
					}
					docNode.children("docArea").text(area.val());
					docNode.children("docBlock").text(block.val());
					docNode.children("docPlot").text(plot.val());
					//docNode.children("docBuilding").text(building.val());
					//docNode.children("docPACINumber").text(paci_number.val());
					docNode.children("docTitle").text(title.val());
					selectXmlNodes();
				} else {
					//var o = [{"docDate": getDate(), "docApprover": userInfo[0].displayName}];
					if (udateIfExists == 0)
						docNode.docHistory = [{"docDate": getDate(), "docApprover": userInfo[0].displayName}];
					docNode.docFileNumber = file_number.val();
					docNode.docArea = area.val();
					docNode.docBlock = block.val();
					docNode.docPlot = plot.val();
					//docNode.docBuilding = building.val();
					//docNode.docPACINumber = paci_number.val();
					docNode.docTitle = title.val();
					selectJsonNodes();
				}
			} else {
				var dates = []; dates[0] = getDate();
				var names = []; names[0] = userInfo[0].displayName;
				//addDocToList($('.customMiddleSide #docs'), 0, 
				addDocToList($('#docs'), 0, 
							file_number.val(), dates, names, area.val(), block.val(), plot.val(), sectionId);
//							file_number.val(), dates, names, area.val(), block.val(), street.val(), building.val(), paci_number.val(), sectionId);

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
					
					el = createElement("docPlot", plot.val());
					doc.appendChild(el); appendNewLineElement(doc, 8);
					
					//el = createElement("docBuilding", building.val());
					//doc.appendChild(el); appendNewLineElement(doc, 8);

					//el = createElement("docPACINumber", paci_number.val());
					//doc.appendChild(el); appendNewLineElement(doc, 8);

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
					doc.docPlot = plot.val();
					//doc.docBuilding = building.val();
					//doc.docPACINumber = paci_number.val();
					doc.docTitle = title.val();
					rootDoc[0].docs.push({"doc": doc});
				}
			}
			return newDoc;
		} else {
			return true;	// true - do not close dialog
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
				//$("#custom_jsTree>ul").append('<li rel="department" id="' + section_index + '"><a href="#">' + $(this).attr('name') + '</a></li>');
				//$("#custom_jsTree>ul").append('<li rel="department" id="' + $(this).attr('id') + '"><a href="#">' + $(this).attr('name') + '</a></li>');
				$("#custom_jsTree>ul").append('<li rel="department" id="' + $(this).attr('id') + '"><a href="#">' + (($("body[dir='ltr']").length) ? $(this).attr('name') : $(this).attr('arName')) + '</a></li>');
				//$("#custom_jsTree>ul").data('id', $(this).attr('id'));
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
							return true;			//?????
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
						/*
						var tree_size = $("#custom_jsTree>ul>li").length;
						for (var i = 0; i < tree_size; i++) {
							if (i == actorSectionNumber)
								$("#custom_jsTree").jstree("open_node", $("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")"));
							else
								$("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")").hide();
						}
						*/
						$("#custom_jsTree>ul>li").each(function(i) {
							if (sectionId == $(this).attr('id')) {
								$('#custom_jsTree').jstree("open_node", $("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")"));
							} else
								$("#custom_jsTree>ul>li:nth-child(" + (i + 1) + ")").hide();
						})						
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
		section = createElementWithAttribute("section", 'id', $(this).parent().attr('id'));
		appendAttributeToElement(section, 'name', $(this).text().trim());
		appendAttributeToElement(section, 'arName', $(rootActors).find('section[id="' + $(this).parent().attr('id') + '"]').attr('arName'));
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
			
			$("#datepicker").datepicker( "option", $.datepicker.regional[ (lang == "en") ? "" : lang ] );
			$("#datepicker2").datepicker( "option", $.datepicker.regional[ (lang == "en") ? "" : lang ] );
			$("#date_submission").datepicker( "option", $.datepicker.regional[ (lang == "en") ? "" : lang ] );

			$("#datepicker").datepicker( "option", "dateFormat", "dd/mm/yy" );
			$("#datepicker2").datepicker( "option", "dateFormat", "dd/mm/yy" );
			$("#date_submission").datepicker( "option", "dateFormat", "dd/mm/yy" );
			
			var change = true;
			if (lang == "ar")
				change = false;
				
			$("#datepicker").datepicker("option", "changeMonth", change);
			$("#datepicker2").datepicker("option", "changeMonth", change);
			$("#date_submission").datepicker("option", "changeMonth", change);
		
			$('#Copyright').text(jQuery.i18n.prop('Copyright'));
			$('#MediaCenter').text(jQuery.i18n.prop('MediaCenter'));
			$('#ContactUs').text(jQuery.i18n.prop('ContactUs'));
			$('#CustomerService').text(jQuery.i18n.prop('CustomerService'));
			$('#SiteMap').text(jQuery.i18n.prop('SiteMap'));
			$('#TrainingProgram').text(jQuery.i18n.prop('TrainingProgram'));
			$('#PrivacyPolicy').text(jQuery.i18n.prop('PrivacyPolicy'));
			
			//$('#LogIn').text(jQuery.i18n.prop('LogIn'));
			//$('#status').text(jQuery.i18n.prop('Status'));
			//$('#reject').text(jQuery.i18n.prop('Rejected'));
			//$('#approve').text(jQuery.i18n.prop('InProgress'));
			//$('#complete').text(jQuery.i18n.prop('Completed'));
			
			$("#tabs>ul>li").find('a[href="#tab-pending"]').text(jQuery.i18n.prop("PendingDocsListTab"));
			$("#tabs>ul>li").find('a[href="#tab-inprocess"]').text(jQuery.i18n.prop("InProcessDocsListTab"));
			$("#tabs>ul>li").find('a[href="#tab-vault"]').text(jQuery.i18n.prop("VaultDocsListTab"));
			$("#tabs>ul>li").find('a[href="#tab-rejected"]').text(jQuery.i18n.prop("RejectedDocsListTab"));
			$("#tabs>ul>li").find('a[href="#tab-edafat"]').text(jQuery.i18n.prop("EdafatTab"));
			//if (actor == actor_enum.manager)
			$("#tabs>ul>li").find('a[href="#tab-users"]').text(jQuery.i18n.prop("UserAssignmentTab"));
			//else if (actor == actor_enum.employee)
			$("#tabs>ul>li").find('a[href="#tab-edit"] span').text(jQuery.i18n.prop("CreateUpdateDocumentTab"));

			
			if (dir == 'ltr') {
				$(".tagButton").css("left", ""); 
				$(".tagButton").css("right", "2px");
				$(".customRightSide").css("text-align", "right");
				$(".customMiddleSide, .customRightSide, #userList").css("box-shadow", "4px 4px 2px #999");
				$(".customMiddleSide #docs li, .docButtons").css("box-shadow", "2px 2px 2px #999");

			//	$(".docDetailDiv select").css({'margin-left':'20px', 'margin-right':0});
			//	$(".docPACINumber").css({'margin-left': 0, 'margin-right':'20px'});
			} else {
				$(".tagButton").css("right", ""); 
				$(".tagButton").css("left", "2px");
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
			$("#cancelButton").button({label: jQuery.i18n.prop('Cancel')});
			
			$('#validateTips').html(jQuery.i18n.prop('ValidateTips'));
			$('label[for="file_number"]').html('<strong>' + jQuery.i18n.prop('File') + '</strong>');
			$('label[for="area"]').html('<strong>' + jQuery.i18n.prop('Area') + '</strong>');
			$('label[for="block"]').html('<strong>' + jQuery.i18n.prop('Block') + '</strong>');
			$('label[for="plot"]').html('<strong>' + jQuery.i18n.prop('Plot') + '</strong>');
			//$('label[for="building"]').html('<strong>' + jQuery.i18n.prop('Building') + '</strong>');
			//$('label[for="paci_number"]').html(jQuery.i18n.prop('PACI'));
			$('#labTitle').html('<strong>' + jQuery.i18n.prop('Title') + '</strong>');
			$('.docFileNumber>div').html('<strong>' + jQuery.i18n.prop('File') + ':&nbsp;</strong>');
			$('.docAddress>div').html('<strong>' + jQuery.i18n.prop('Address') + ':&nbsp;</strong>');
			//$('.docPACINumber>div').html('<strong>' + jQuery.i18n.prop('PACI') + ':&nbsp;</strong>');

			$("#approver_search>option:first").html('--- ' + jQuery.i18n.prop('Select') + ' ---');
			//$("#area_search>option:first").html('--- ' + jQuery.i18n.prop('Select') + ' ---');
			
			//$("#accordion>span:nth-child(1)>:nth-child(1)").text(jQuery.i18n.prop('Search'));
			var obj = $("#accordion>span:nth-child(1)").contents().filter(function() {return this.nodeType == 3;});
			obj.get()[0].textContent = jQuery.i18n.prop('Search');
			$("#accordion>div>div:first>span").text(jQuery.i18n.prop('File'));
			//$("#accordion>div>div:nth-child(2)>span").text(jQuery.i18n.prop('PACI'));
			$("#accordion>div>div:nth-child(2)>span").text(jQuery.i18n.prop('Approver'));
			$("#accordion>div>div:nth-child(3)>span").text(jQuery.i18n.prop('DateFrom'));
			$("#accordion>div>div:nth-child(4)>span").text(jQuery.i18n.prop('DateTo'));
			$("#accordion>div>div:nth-child(5)>span").text(jQuery.i18n.prop('Area'));
			$("#accordion>div>div:nth-child(6)>span").text(jQuery.i18n.prop('Block'));
			$("#accordion>div>div:nth-child(7)>span").text(jQuery.i18n.prop('Plot'));
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
			
			//selectJsonNodes();
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
		//data = {"func":"byFileNumber", "param":{docFileNumber: fileNumber, filter:{actorRole:actorSectionNumber}}};
		data = {"func":"byFileNumber", "param":{docFileNumber: fileNumber}};
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