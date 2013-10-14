var status_enum = {
	submit: "submit",
	approve: "approve",
	reject: "reject",
	complete: "complete",
	all: "all"
};

var actor_enum = {
	manager: 0x1,
	employee: 0x2
};

var loginName;
var displayName;
var root;
var actor;
var reportTo = null;
var steps_to_approve;
//var readyDone = false;

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

$(document).ready(function () {

	$.get( "actors.xml", 
		function( data ) {
			var a = [], val;
			var managers, employees;
			
			$(data).find('section').each(function() {
				$("#custom_jsTree>ul").append('<li><a href="#">' + $(this).attr('name') + '</a></li>');
				managers = $(this).find('manager');
				if (managers.length != 0) {
					$("#custom_jsTree>ul>li:last-child").append('<ul></ul>');
					managers.each(function() {
						//$("#custom_jsTree>ul>li:last-child>ul").append('<li><a href="#">' + $(this).attr('name') + '</a></li>');
						//$("#userList ul").append('<li class="ui-state-default">' + $(this).attr('name') + "</li>");
						val = $(this).attr('name');
						callAspNetWebService("GetUserInfo", '{"loginName":"' + val + '"}');
						val = displayName + " (" + loginName + ") ";
						$("#custom_jsTree>ul>li:last-child>ul").append('<li><a href="#">' + val + '</a></li>');
						if (a.indexOf(val) == -1)
							a.push(val);
						employees = $(this).find('employee');
						if (employees.length != 0) {
							$("#custom_jsTree>ul>li:last-child>ul>li:last-child").append('<ul></ul>');
							employees.each(function() {
								//$("#custom_jsTree>ul>li:last-child>ul>li:last-child>ul").append('<li><a href="#">' + $(this).text() + '</a></li>');
								val = $(this).text();
								callAspNetWebService("GetUserInfo", '{"loginName":"' + val + '"}');
								val = displayName + " (" + loginName + ") ";
								$("#custom_jsTree>ul>li:last-child>ul>li:last-child>ul").append('<li><a href="#">' + val + '</a></li>');
								if (a.indexOf(val) == -1)
									a.push(val);
								//$("#userList ul").append('<li class="ui-state-default">' + $(this).text() + "</li>");
							})
						}
					})
				}
			})

			a.sort(
				function(a, b) {
					if (a.toLowerCase() < b.toLowerCase()) return -1;
					if (a.toLowerCase() > b.toLowerCase()) return 1;
					return 0;
				}
			);
			
			a.forEach(function(name){
				//callAspNetWebService("GetUserInfo", '{"loginName":"' + name + '"}');
				//$("#userList>ul").append('<li class="ui-state-default jstree-draggable">' + displayName + " (" + loginName + ") </li>");
				$("#userList>ul").append('<li class="ui-state-default jstree-draggable">' + name + "</li>");
			});
			
			//$("#userList>ul").sortable({ revert:true });
			$("#userList>ul>li").draggable({helper: "clone", cursor: "move", revert: "valid", containment: ".customLeftSide", scroll: false, opacity: 0.7, zIndex: 100  });
			$("#sortable>ul").disableSelection();
			
			$("#custom_jsTree")
				.bind("loaded.jstree", function (e, data) {
					$("#custom_jsTree").show();
					$("#userList").show();
					$('#custom_jsTree').jstree("open_node", $("#custom_jsTree>ul>li")); 
				})
				.bind("select_node.jstree", function (event, data) {
					//data.inst.delete_node(data.rslt.obj);
				})
				.bind("before.jstree", function (e, data) {
					if (data.func === "remove" && !confirm("Are you sure?")) {
						e.stopImmediatePropagation();
						return false;
					}
				})
				.bind("create.jstree", function (e, data) {
						//alert(data.rslt.new_name);
						//e.stopImmediatePropagation();
						//return false;
				})
				.bind("rename.jstree", function (e, data) {
						//alert(data.rslt.new_name);
						//e.stopImmediatePropagation();
						//return false;
				})
				.bind("remove.jstree", function (e, data) {
						//alert(data.rslt.new_name);
						//e.stopImmediatePropagation();
						//return false;
				})
				//.bind('keydown', '/', function (e, data) {
				//	if (data.func === "remove") {
				//		e.stopImmediatePropagation();
				//		return false;
				//	}
				//})
				.jstree({
					"core" : { 
						//"initially_open" : [ "Follow Up", "AC" ] 
					},
					"dnd" : {
						"drop_finish" : function () { 
							alert("DROP"); 
						},
						"drag_check" : function (data) {
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
							var node =  data.r;
							
							if (this.is_leaf(node))
								this.rename_node(node, data.o.innerHTML);
							else
								this.create_node(node, "first", {data: data.o.innerHTML }, false, false);
							
							

							//alert(this._get_parent(data.r)); 
						}
					},
					"hotkeys" : {
						"f2" :  function (event) {
							if (this.is_selected()) {
								if (this._get_parent(data.r) == -1)							
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
					//callback: {
					//	onselect: function(NODE, TREE_OBJ) {
					//		alert(NODE.id);
					//	}
					//},
					
					"plugins" : [ "themes", "html_data", "ui", "crrm", "hotkeys", "dnd" ]
				});

			
			//var v;
/*			
			if ((v = $(data).find('manager[name="' + loginName + '"]')).length != 0) {
				actor = actor_enum.manager;
				reportTo = v.closest('section').next().find('manager').attr('name');
			} else {
				$(data).find('employee').each(function(){
					if ($(this).text() == loginName) {
						actor = actor_enum.employee;
						reportTo = $(this).closest('manager').attr('name');
						return false;
					}
				})
			}
*/		
		}
	);

});	

function callAspNetWebService(url, data) {	
	$.ajax({ type: "POST",
		async: false,
		//url: "ASPNetWebService.asmx/GetUserInfo",
		url: "ASPNetWebService.asmx/" + url,
		contentType: "application/json; charset=utf-8",
		//contentType: "application/xml; charset=utf-8",
		//dataType: "xml",
		dataType: "json",
		data: data,
		//data: "{}",
		processData: false,
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			//alert("Status: " + errorThrown);
			loginName = $.parseJSON(this.data).loginName;
			displayName = loginName;
			//$("#userList>ul").append('<li class="ui-state-default jstree-draggable">' + $.parseJSON(this.data).loginName + "</li>");
		},
		success: function(data) {
			//$('#userName').text($(data).text());	//xml response
			//$('#userName').text(data.d);			//json response
			//data.d.Data[0].Groups[1].toString();
			//data.d.Data[0].Groups.length;
			loginName = data.d.Data[0].LoginName;
			displayName = data.d.Data[0].DisplayName;
			//$("#userList>ul").append('<li class="ui-state-default jstree-draggable">' + displayName + " (" + loginName + ") </li>");

			//$('#userName').text(displayName);
		}
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
			
			$('#labTitle').html('<strong>' + jQuery.i18n.prop('Title') + '</strong>');
			$('#labDescription').html('<strong>' + jQuery.i18n.prop('Description') + '</strong>');
			
		}				
	});
}

function selectXmlNodes(category) {
	$(".customMiddleSide>ul").empty();
	
	var i = 0;
	$(root).find('task').each(function(){
		//var name = $(this).find('taskNumber').text();
		var history = $(this).find('taskHistory');
		i = history.children().length;
		var date = [];
		var name = [];
		
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
		
		i = 0;
		
		var j = 0;
		$(history).find('taskDate').each(function(){
			date[j] = $(this).text();
			//var n = $(history).find('taskApprover')[j];
			name[j] = $($(history).find('taskApprover')[j]).text();
			j++;
		});
		
		addTaskToList($('.customMiddleSide>ul'), i++,
					$(this).find('taskNumber').text(),
					date,
					name,
					$(this).find('taskTitle').text()
					//$(this).find('taskDescription').text(),
					//$(this).find('taskStatus').text()
					);
		//alert(name);
	});					
}	

//$('.customMiddleSide>ul').empty();

//function addTaskToList(list, id, paci_number, date, name, title, description, status) {
function addTaskToList(list, id, paci_number, date, name, title) {
	// Create a copy of the <li> template
	var itemTemplate = $('#TemplateListItem').clone();

	// Remove the unnecessary id attribute
	itemTemplate.attr('id', null);

	itemTemplate.find('.taskNumber span').text(paci_number);
	
	var selectTag = itemTemplate.find('.taskDetailDiv select');

	var i = 0;
	$(date).each(function(){
		//$('<option></option>').attr('value', i + 1).html($(date)[i]).appendTo(selectTag);
		//$('<option/>', {'value': i + 1, 'selected':'selected'}).html($(date)[i++]).appendTo(selectTag);
		
		var nam = ((i == 0) ? 'Submitted ' : 'Approved &nbsp;') + $(date)[i] + ' by ' + $(name)[i];
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


	
	//selectTag.append(option);
	
	//itemTemplate.find('.taskDate span').text(date);
	//itemTemplate.find('.taskApprover span').text(name);

	// Set the title to the task title
	itemTemplate.find('.taskTitle span').text(title);

	// Set the description to the task description
	//itemTemplate.find('.taskDescription span').html(description);

	checkStatus(itemTemplate, selectTag.children().length);

	itemTemplate.data('status', status);
	itemTemplate.data('taskID', id);

	// Add Task Element created from template
	list.append(itemTemplate);
}

function checkStatus(itemTemplate, li_count) {

	//var button_images = $(itemTemplate).find("a img");
	var button_images = $(itemTemplate).find("a");

	itemTemplate.removeClass();
	//$($(button_images)[0]).css("display", "none");	//reject button
	$($(button_images)[1]).css("display", "none");		//approve button
	$($(button_images)[2]).css("display", "none");		//edit button
	
	if (li_count >= steps_to_approve) {
		//itemTemplate.css('box-shadow','2px 2px 2px #0f0');
		itemTemplate.addClass('taskItemBorderGreen');
	} else if (li_count > 1) {
//			itemTemplate.css('box-shadow','2px 2px 2px #f00');
		itemTemplate.addClass('taskItemBorderYellow');
		$($(button_images)[0]).css("display", "block");		//reject button
		$($(button_images)[1]).css("display", "block");		//approve button
		//$($(button_images)[2]).css("display", "block");		//edit button
	} else {
//			itemTemplate.css('box-shadow','2px 2px 2px #999');
		itemTemplate.addClass('taskItemBorderRed');
		$($(button_images)[2]).css("display", "block");		//edit button
	}
}

$(document).on("click", ".taskItemApproveButton", function(){
	commentDialog(this, "approve");
	//var obj = $("#dialog-form-comments");
	//obj.data("approve_fn", approve); 
	//obj.dialog( "open" );
});

$(document).on("click", ".taskItemRejectButton", function(){
	commentDialog(this, "reject");
	//var obj = $("#dialog-form-comments");
	//obj.data("approve_fn", approve); 
	//obj.dialog( "open" );
});

this.commentDialog = function(that, action) {
    //$("#commentDialog").dialog( "destroy" );
    //html = "<div id='cmtDialog'>";
    //html += "Comment<textarea id='comment'></textarea></div>";
	var taskNumber = $(that).closest("div").find(".taskNumber span").text();
	var xmlNode = $(root).find("task>taskNumber:contains('" + taskNumber + "')");
	var html = '<div style="overflow:auto; height: 325px;" class="floatLeft">' + xmlNode.siblings('taskComment').text() + "</div><br/>";
	html += '<textarea name="comment" id="comment" rows="4" class="text ui-widget-content ui-corner-all" ></textarea>';
	var obj = $("#dialog-form-comments");
    obj.html(html);
    obj.prop('currentConext', that);
    obj.dialog({
        title:jQuery.i18n.prop('Comment'),
        height: 580,
        width: 600,
        modal: true,
		autoOpen: true,
        buttons: { 
			//"Ok": this.approve,
			Ok: function() {
				var that = this.currentConext;
				if (action == status_enum.approve)
					approve(that);
				else if (action == status_enum.reject)
					reject(that);
				//$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		open: function( event, ui ) {
			this.firstChild.scrollTop = this.firstChild.scrollHeight;
			$(this).parent().find(".ui-button-text").each(function() {
				var that = $(this);
				if (that.text() == "Ok")
					that.text(jQuery.i18n.prop('Ok'));
				else if (that.text() == "Cancel")
					that.text(jQuery.i18n.prop('Cancel'));
			});
		}
    });
};

function approve(that) {
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
	
	//var signature;
	var dt = getDate();
/*	
	var d = new Date();
	var month = d.getMonth() + 1;
	month = (('' + month).length < 2 ? '0' : '') + month;
	
	var dt = d.getDate() + "/" + month + "/" + d.getFullYear();
	var nam = 'Approved \&nbsp;' + dt + ' by ' + userName;
*/
	var signature = 'Approved \&nbsp;' + dt + ' by ' + displayName;

	var html = '<option selected="selected" value="' + selectTag.children().length + '">' + signature + '</option>';
	selectTag.append(html);
	//return;
	
	var taskNumber = $(that).closest("div").find(".taskNumber span").text();
	//var taskNumber = $(this).closest("div").find(".taskNumber span").text();
	//var v = $(root).find("task>taskNumber:contains('" + taskNumber + "')").next().find("taskApprover").last();
	var xmlNode = $(root).find("task>taskNumber:contains('" + taskNumber + "')");
	//$(root).find("task>taskNumber").each(function(){
		//if ($(this).text() == taskNumber) {
	if (xmlNode.text() != "") {
		//var v = $(this).parent().find("taskHistory");
		//var v = $(this).next("taskHistory");
		var v = xmlNode.next("taskHistory");
		
		//var el2 = document.createElementNS("", "taskDate");
		//var content = document.createTextNode(dt);			
		//el2.appendChild(content);
		//v.append(el);
		//var el;
		//var el = createElement("taskDate", dt);
		v.append(createElement("taskDate", dt));
		v.append(appendNewLineElement());
		//el = document.createElementNS("", "taskApprover");
		//content = document.createTextNode(displayName);			
		//el.appendChild(content);
		//v.append(el);

		v.append(createElement("taskApprover", displayName));
		v.append(appendNewLineElement());
		
		//el = document.createElementNS("", "taskComment");
		//content = document.createTextNode(comment);			
		//el.appendChild(content);
		html = xmlNode.siblings('taskComment').text();
		html += '<span class="ca">' + signature + "</span><br/>" + comment + "<br/>";
		var el = createElement("taskComment", html);
		//$(this).siblings('taskComment').replaceWith(el);
		xmlNode.siblings('taskComment').replaceWith(el);

		//$("<taskDate>" + dt + "</taskDate>").appendTo(v);
		//$("<taskApprover>" + nam + "</taskApprover>").appendTo(v);
		//v.append($("<taskDate>" + dt + "</taskDate>"));
		//v.append($("<taskApprover>" + nam + "</taskApprover>"));
		//return;
	//});
	
		var itemTemplate = $(this).closest("div").closest("li");
		checkStatus(itemTemplate, selectTag.children().length);
		
		$.post("xml-crud.php", {'xml' : $.xml(root)},
			function(data, status){
				//if (data.error) {
				//alert("Data: " + data + "\nStatus: " + status);
				//}
			}, "text"
		);
	}
}	

function createElement(name, value) {
	var el = document.createElementNS("", name);
	//return el2;
	//return el2.appendChild(document.createTextNode(value));
	var textNode = document.createTextNode(value);
	el.appendChild(textNode);
	return el;
	//return el;
}

function appendNewLineElement(el) {
	var textNode = document.createTextNode('\n');
	if (el == undefined)
		return textNode;
	el.appendChild(textNode);
	return el;
}

function getDate() {
	var d = new Date();
	var month = d.getMonth() + 1;
	month = (('' + month).length < 2 ? '0' : '') + month;
	return d.getDate() + "/" + month + "/" + d.getFullYear();
	//return action + ' \&nbsp;' + dt + ' by ' + displayName;
}

//$(document).on("click", ".taskItemRejectButton", function(){
function reject(that) {
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
	
	var taskNumber = $(that).closest("div").find(".taskNumber span").text();
	//var v = $(root).find("task>taskNumber:contains('92066')").next().find("taskApprover").last();
	var xmlNode = $(root).find("task>taskNumber:contains('" + taskNumber + "')");
	//$(root).find("task>taskNumber").each(function(){
		//if ($(this).text() == taskNumber) {
	if (xmlNode.text() != "") {
	
	//$(root).find("task>taskNumber").each(function(){
		//if ($(this).text() == taskNumber) {
			//var v = $(this).parent().find("taskHistory");
		var v = xmlNode.next("taskHistory");
		v.find("taskApprover").last().remove();
		v.find("taskDate").last().remove();


			//$("<taskDate>" + dt + "</taskDate>").appendTo(v);
			//$("<taskApprover>" + nam + "</taskApprover>").appendTo(v);
			//v.append($("<taskDate>" + dt + "</taskDate>"));
			//v.append($("<taskApprover>" + nam + "</taskApprover>"));
			//return;
		//}
	//});
	
	
		var signature = 'Rejected \&nbsp;' + getDate() + ' by ' + displayName;
		var html = xmlNode.siblings('taskComment').text();
		html += '<span class="cr">' + signature + "</span><br/>" + comment + "<br/>";
		var el = createElement("taskComment", html);
	
		//var el = createElement("taskComment", comment);
		//$(this).siblings('taskComment').replaceWith(el);
		xmlNode.siblings('taskComment').replaceWith(el);

		var itemTemplate = $(this).closest("div").closest("li");
		checkStatus(itemTemplate, selectTag.children().length);
		
		//return;
		
		$.post("xml-crud.php", {'xml' : $.xml(root)},
		function(data, status){
			//if (data.error) {
			//alert("Data: " + data + "\nStatus: " + status);
			//}
		}, "text");
	}
}	

function scrollEvent(eventData) {
	var i;
	i = 0;
}


$(function() {

	$(document).on("click", "#newTaskItemButton", function(){
		newEditDialog();
		var el = $("#dialog-form-new");
		el.data("taskItem", null);
		el.dialog( "open" );
	});

	$(document).on("click", ".taskItemEditButton", function(){
		newEditDialog();
		var el = $("#dialog-form-new");
		el.data("taskItem", $(this)); 
		el.dialog( "open" );
	});

	var paci_number = $( "#paci_number" ),
		title = $( "#title" ),
		description = $( "#description" ),
		//email = $( "#email" ),
		//password = $( "#password" ),
		allFields = $( [] ).add( paci_number ).add( title ).add( description ),
		tips = $( ".validateTips" );
	
	function updateTips( t ) {
		tips.text( t ).addClass( "ui-state-highlight" );
		setTimeout(function() {
			tips.removeClass( "ui-state-highlight", 1500 );
		}, 500 );
	}

	function isRequired( o, n ) {
		if ( o.val().length == 0 ) {
			o.addClass( "ui-state-error" );
			updateTips( "Field " + n + " cannot be empty." );
			o.focus();
			return false;
		} else {
			return true;
		}
	}
	
	function checkLength( o, n, min, max ) {
		if ( o.val().length > max || o.val().length < min ) {
			o.addClass( "ui-state-error" );
			updateTips( "Length of " + n + " must be between " + min + " and " + max + "." );
			o.focus();
			return false;
		} else {
			return true;
		}
	}
	function checkRegexp( o, regexp, n ) {
		if ( !( regexp.test( o.val() ) ) ) {
			o.addClass( "ui-state-error" );
			updateTips( n );
			return false;
		} else {
			return true;
		}
	}
	
	newEditDialog = function() {
		$( "#dialog-form-new" ).dialog({
			title:jQuery.i18n.prop('RegisterNewDoc'),
			autoOpen: false,
			height: 460,
			width: 480,
			modal: true,
			buttons: {
				"Send": function() {
					var bValid = true;
					allFields.removeClass( "ui-state-error" );
					bValid = bValid && checkLength( paci_number, "PACI Number", 5, 5 );
					bValid = bValid && checkRegexp( paci_number, /^([0-9])+$/, "PACI Number field only allow : 0-9" );
					bValid = bValid && isRequired( title, "Title" );
					bValid = bValid && isRequired( description, "Description" );

					/*
					bValid = bValid && checkRegexp( name, /^[a-z]([0-9a-z_])+$/i, "User name may consist of a-z, 0-9, underscores, begin with a letter." );
					// From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
					bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "Wrong e-mail address." );
					bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
					*/
					if ( bValid ) {
						var that = $(this);							// dialog form context
						if (that.data('taskItem') != null) {
							var taskItem = that.data('taskItem');	// button context
							taskItem.siblings(".taskTitle").find("span").text(title.val());
							taskItem.siblings(".taskDescription").find("span").text(description.val());

							//var taskNumber = taskItem.siblings(".taskNumber").find("span").text();
							//var xmlNode = $(root).find("task>taskNumber:contains('" + taskNumber + "')");
							var xmlNode = $(root).find("task>taskNumber:contains('" + paci_number.val() + "')");
							//$(root).find("task>taskNumber").each(function(){
								//if ($(this).text() == taskNumber) {
							if (xmlNode.text() != "") {
								//var el = createElement("taskComment", comment);
								//$(this).siblings('taskComment').replaceWith(el);
								xmlNode.siblings('taskTitle').text(title.val());
								xmlNode.siblings('taskDescription').text(description.val());

								$.post("xml-crud.php", {'xml' : $.xml(root)},
								function(data, status){
									//if (data.error) {
									//alert("Data: " + data + "\nStatus: " + status);
									//}
								}, "text");
							}
						} else {
							//var dt = getDate();
							var task = document.createElementNS("", "task");appendNewLineElement(task);
							var el = createElement("taskNumber", paci_number.val());
							task.appendChild(el);appendNewLineElement(task);
							var taskHistory = document.createElementNS("", "taskHistory");appendNewLineElement(taskHistory);
							el = createElement("taskDate", getDate());
							taskHistory.appendChild(el);appendNewLineElement(taskHistory);
							el = createElement("taskApprover", displayName);
							taskHistory.appendChild(el);appendNewLineElement(taskHistory);
							task.appendChild(taskHistory);appendNewLineElement(task);
							el = createElement("taskTitle", title.val());
							task.appendChild(el);appendNewLineElement(task);
							el = createElement("taskDescription", description.val());
							task.appendChild(el);appendNewLineElement(task);
							el = createElement("taskComment", "");
							task.appendChild(el);appendNewLineElement(task);
							root.documentElement.appendChild(task);appendNewLineElement(root.documentElement);
							$.post("xml-crud.php", {'xml' : $.xml(root)},
							function(data, status){
								//if (data.error) {
								//alert("Data: " + data + "\nStatus: " + status);
								//}
							}, "text");
							
							selectXmlNodes(status_enum.approve);

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
						}
						
						$( this ).dialog( "close" );
					}
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			},
			close: function() {
				allFields.val( "" ).removeClass( "ui-state-error" );
			},
			open: function( event, ui ) {
				var that = $(this);
				if (that.data('taskItem') != null) {
					var taskItem = that.data('taskItem');
					var taskNumber = taskItem.siblings(".taskNumber").find("span").text();
					that.find("#paci_number").val(taskNumber);
					that.find("#paci_number").attr('readonly','readonly');
					
					that.find("#title").val(taskItem.siblings(".taskTitle").find("span").text());
					
					var xmlNode = $(root).find("task>taskNumber:contains('" + taskNumber + "')");
					that.find("#description").val(xmlNode.siblings('taskDescription').text());
					//that.find("#description").val(taskItem.siblings(".taskDescription").find("span").text());
				} else
					that.find("#paci_number").removeAttr('readonly');
				
				$(this).parent().find(".ui-button-text").each(function() {
					var that = $(this);
					if (that.text() == "Send")
						that.text(jQuery.i18n.prop('Send'));
					else if (that.text() == "Cancel")
						that.text(jQuery.i18n.prop('Cancel'));
				});
			}
		});
	};
	
	$( document ).tooltip({
		//items: ".taskDetailDiv, .taskDetailDiv select, .taskDetailDiv a, .customSearchGo",
		items: ".taskDetailDiv, .taskDetailDiv select, .taskDetailDiv a",
		show: {	effect: "fadeIn", delay: 1000, duration: 500 },
		content: function() {
			var element = $(this);
			//if ( element.is( ".taskDetailDiv a" ) || element.is( ".customSearchGo" ) ) {
			//	$( document ).tooltip( {tooltipClass: "ui-tooltip-for-button"} );
			//	return element.attr( "title" );
			//}
			if ( element.is( ".taskDetailDiv a" ) || element.is( ".taskDetailDiv select" ) ) {
				return;
			}
				
			$( document ).tooltip( {tooltipClass: "ui-tooltip-for-item"} );
			//var item = element.find(".taskDescription").clone();
			
			var taskNumber = element.find(".taskNumber span").text();
			var xmlNode = $(root).find("task>taskNumber:contains('" + taskNumber + "')");
			//var item = xmlNode.siblings("taskDescription").text();
			//item += xmlNode.siblings("taskComment").text();
			
			var direction = "floatLeft";
			if ($("body[dir='rtl']").length)
				direction = "floatRight";
			
			var html = '<div class="' + direction + '"><div style="float:inherit;"><strong>' + jQuery.i18n.prop('Description') + ': </strong></div>' + xmlNode.siblings('taskDescription').text() + "</div><br/>";
			//html += "<div>" + xmlNode.siblings('taskComment').text() + "</div>";
			
			//itemTemplate.find(".taskNumber").hide();
			//itemTemplate.find(".taskNumber").remove();
			//itemTemplate.find("select").remove();
			//itemTemplate.find("a").remove();
			//itemTemplate.find(".taskTitle").remove();
			//itemTemplate.find(".taskTitle").removeClass("taskTitle");
			//itemTemplate.find(".taskDescription").removeClass("taskDescription");
			//itemTemplate.find(".taskDescription").show();
			$(html).show();
			//itemTemplate.find(".taskDescription").position().top(itemTemplate.find(".taskNumber").position().top);
			return html;
			
//			var element = $( this );
			//if ( element.is( "[data-geo]" ) ) {
//				var text = element.text();
//				return "<span>" + "text" + "</span>";
/*
				return "<img class='map' alt='" + text +
				"' src='http://maps.google.com/maps/api/staticmap?" +
				"zoom=11&size=350x350&maptype=terrain&sensor=false&center=" +
				text + "'>";
*/				
			//}
		}
	});
	
});

function setbg(color)
{
	document.getElementById("title").style.background=color;
}