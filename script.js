var idp, idpSource;
var documentSource;
var lang;
var searchInterval;

var _superuser;

var userInfo;
var rootActors;
var actor;
var sectionId;				// id of  section of the department, like: follow_up, ac...
var reportTo = null;
var areaNames;

var _currentForm;
var _formButtonSet;
var _applicationNumber = "";
var	_jasperReportsServerConnection = false;
var _jasperReportsURL = "http://" + location.hostname +  ":8084/TawzeeJasperReports/JasperServlet";
var _slider; 

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
	archive: "39",
};

//first, checks if it isn't implemented yet
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != undefined
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
	$.ajaxSetup({ cache: false, async: false });

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
	
	if (navigator.userAgent.match(/msie/i))
		$.blockUI.defaults.overlayCSS.cursor = 'default';

	$.blockUI.defaults.centerX = true;
	$.blockUI.defaults.centerY = true;

	// Ajax activity indicator bound to ajax start/stop document events
	$(document)
		.ajaxStart(function(){
			$.blockUI();
		})
		.ajaxStop(function(){
			$.unblockUI();
		});
	
	$.get("get_ini.php")
		.done(function(data) {
			idp = data.IdP;
			idpSource = data.IdPSource;
			documentSource = data.documentSource;
			lang = data.lang;
			searchInterval = data.searchInterval;
		});
	

	$("#flagKuwait").off("click").on("click", function(event){
		if ($("body[dir='ltr']").length) {
			lang = 'ar';
			//$(videoControl).hide();
			toggleLanguage('ar', 'rtl');
			//$(videoControl).show();
		}
	});

	$("#flagUK").off("click").on("click", function(event){
		if ($("body[dir='rtl']").length) {
			lang = 'en';
			toggleLanguage('en', 'ltr');
		}
	});

	$.datepicker.setDefaults( $.datepicker.regional[ "" ] );
	$.datepicker.setDefaults({
		//regional: "",
		showOn: "both",
		buttonImageOnly: true,
		buttonImage: "images/calendar.gif",
		buttonText: "Calendar",
		//changeMonth: 'true',
		//changeYear: 'true'
	});
	
	$(".rid50-datepicker").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "dd/mm/yy",
	});
	
	//$("#application-date").datepicker( "setDate", "now" );
	$('input[id="application-date"]').change(function() {
		var regExpPattern = /^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)\d\d$/;
		if (!$(this).val().match(regExpPattern)) {
			$(this).addClass( "ui-state-error" );
			$("#searchButton").attr('disabled', 'disabled');
		} else {
			$(this).removeClass( "ui-state-error" );
			$("#searchButton").removeAttr("disabled");
		}
	});

	(function ($) {
		$.each(['show', 'hide'], function (i, ev) {
			var el = $.fn[ev];
			$.fn[ev] = function () {
			  this.trigger(ev);
			  return el.apply(this, arguments);
			};
		});
	})(jQuery);
		
	$('#main-form').on('show', function() {
		if (_applicationNumber == "") {
			$('#application-number').removeAttr('readonly');
			setTimeout(function() {
				$('#application-number').focus();
			}, 100 );
		}
		
//		this.append('<input type="text" id="error-box" />');	
//		this.append('#formButtonSet');
	});

	$('#main-form').on('hide', function() {
		$(this).find("input[type='text']").removeClass("ui-state-error");
		$('#application-number').attr('readonly','readonly');
		error('');
	});
	
	$('#load-form').on('show', function() {
		if ($('#file-number').attr('readonly') === undefined) {
			setTimeout(function() {
				$('#file-number').focus();
			}, 100 );
		}
	});
	 
	$('#load-form').on('hide', function() {
		$(this).find("input[type='text']").removeClass("ui-state-error");
		//$('#file-number').attr('readonly','readonly');
		error('');
	});
	 
	$('#report-container').on('show', function() {
		loadStampedSignatures();
	});

	$('#report-container').on('hide', function() {
		$('#report-container div').remove();
		$('#report-container img').remove();
	});

	$('#flexslider-container').on('hide', function() {
		$(".slider").remove();
	});
	
/*
	$('#divGrid').on('hide', function() {
		if ($('#error-box2').length > 0)
			$('#error-box2').remove();
	});
*/	
	_currentForm = "main-form";

//	$('#attachmentTitles').on("click", function(event){
//		$('#attachmentTitles>div>a').on("click", function(event){
//				alert(this.getAttribute("data-id"));
//		});
//	});
	
	$('#application-form-link, #load-form-link').on("click", function(event){
		_currentForm = this.getAttribute('data-form');

		if ($('#application-number').attr('readonly') == undefined && _currentForm == "load-form")
			return;
		
		if (_applicationNumber != "") {
			var data;
			if ("main-form" == _currentForm)
				data = {"func":"getApp"};
			else
				data = {"func":"getLoad"};

			data.param = {"applicationNumber": _applicationNumber};
			
			//data = {"func":"getLoad", "param":{applicationNumber:_applicationNumber}};
				
			$.get("json_db_crud_pdo.php", data)
				.done(function( data ) {
					if (isAjaxError(data))
						return;
				
					// if (data && data.constructor == Array) {
						// if (data[0] && data[0].error !== undefined) {
							// alert (data[0].error);
							// return;
						// }
					// }
					
					if (data.d == undefined)
						result = data;
					else
						result = data.d.Data;
					/*
					$('#file-number').val(result.FileNumber);
					var dt = $.datepicker.parseDate('yy-mm-dd', result.LoadDate);
						
					$('#load-date').val($.datepicker.formatDate('dd/mm/yy', dt));
					
					delete result.FileNumber;
					delete result.LoadDate;
					*/
					//if (result.length == 0)
					//$('.tr-load-detail').not(':first').empty();

					
					var currForm = $('#' + _currentForm);
					if ("main-form" == _currentForm) {
						currForm.find("input[type='text']").not("#application-number, #application-date, #owner-name, #project-name, #area, #block, #plot, #construction-exp-date, #feed-points").val("");
						currForm.find(':radio').not("input[name='project-type']").prop('checked', false);
						currForm.find(':checkbox').prop('checked', false);

						if (result.length == 0) {
							//$('#main-form').children().val("");
						} else {
							//$('#residence-total-area, #construction-area, #conditioning-area').val("");
							$('.tr-application-detail').each(function(index, tr) {
								if (index > 0)
									$(tr).remove();
							})

							var diff = result.length - 1 - $('.tr-application-detail').length;
							if (diff > 0) {
								var lastRow, i;
								for (i = 0; i < diff; i++) {
									lastRow = $('.tr-application-detail:first').clone(true, true);
									$('.tr-application-detail:first').after(lastRow);
								}
								
								//setEventToDeleteRowButtons();
							}

							var tableRow;
							result.forEach(function(r, index) {
								if (index == 0) {
									$('#residence-total-area').val(r.ResidenceTotalArea);
									$('#construction-area').val(r.ConstructionArea);
									$('#ac-area').val(r.ACArea);
									$('#current-load').val(r.CurrentLoad);
									$('#extra-load').val(r.ExtraLoad);
									$('#load-after-delivery').val(r.LoadAfterDelivery);
									$('#conductive-total-load').val(r.ConductiveTotalLoad);
									//$('#feed-points').val(r.FeedPoints);
									setRadioButton('site-feed-point', r.SiteFeedPoint);
									setRadioButton('requirements', r.Requirements);
									setRadioButton('cable-size', r.CableSize);
									setRadioButton('fuze', r.Fuze);
									setRadioButton('meter', r.Meter);
									setCheckBox('possibilityyes', r.PossibilityYes, 4);	//4(100) - bitmask
									setCheckBox('possibilityno', r.PossibilityNo, 4);
									
									// $('input:radio[name=site-feeding-point]')[r.SiteFeedPoint].checked = true;
									// $('input:radio[name=requirements]')[r.Requirements].checked = true;
									// $('input:radio[name=cable-size]')[r.CableSize].checked = true;
									// $('input:radio[name=fuze]')[r.Fuze].checked = true;
									// $('input:radio[name=meter]')[r.Meter].checked = true;
									// $('input:checkbox[name=possibilityyes]')[r.PossibilityYes].checked = true;
									// $('input:checkbox[name=possibilityno]')[r.PossibilityNo].checked = true;
									$('#station-number').val(r.StationNumber);
								} else {
									//tableRow = $('#load-form table tr:nth-child(3)');
									tableRow = $('.tr-application-detail').eq(index - 1);
									tableRow.find('td:first>input').val(r.Switch);
									tableRow.find('td:nth-child(2)>input').val(r.K1000KWT);
									tableRow.find('td:nth-child(3)>input').val(r.K1000AMP);
									tableRow.find('td:nth-child(4)>input').val(r.K1250KWT);
									tableRow.find('td:nth-child(5)>input').val(r.K1250AMP);
									tableRow.find('td:nth-child(6)>input').val(r.K1600KWT);
									tableRow.find('td:nth-child(7)>input').val(r.K1600AMP);
								}
							});
						}
					} else if ("load-form" == _currentForm) {
						currForm.find("input[type='text']").not("#owner-name2, #project-name2, #area2, #block2, #plot2, #construction-exp-date2, #feed-points2").val("");
						if (result.length == 0) {
							$('#file-number').removeAttr('readonly');
						} else {
							$('#file-number').attr('readonly','readonly');
									
							$('.tr-load-detail').each(function(index, tr) {
								if (index > 0)
									$(tr).remove();
							})

							var diff = result.length - 1 - $('.tr-load-detail').length;
							if (diff > 0) {
								var lastRow, i;
								for (i = 0; i < diff; i++) {
									lastRow = $('.tr-load-detail:first').clone(true, true);
									$('.tr-load-detail:first').after(lastRow);
								}
							}

							var ConnectorLoad = 0, SummerLoad = 0, WinterLoad = 0;
							
							var tableRow;
							result.forEach(function(r, index) {
								if (index == 0) {
									$('#file-number').val(r.FileNumber);
									var dt = $.datepicker.parseDate('yy-mm-dd', r.LoadDate);
									$('#load-date').val($.datepicker.formatDate('dd/mm/yy', dt));
									$('#power-factor-summer').val(format( "#,##0.#0", r.PowerFactorSummer));
									$('#power-factor-winter').val(format( "#,##0.#0", r.PowerFactorWinter));
									$('#maximum-loads-summer').val(format( "#,##0.#0", r.MaximumLoadsSummer));
									$('#maximum-loads-winter').val(format( "#,##0.#0", r.MaximumLoadsWinter));
								} else {
									//tableRow = $('#load-form table tr:nth-child(3)');
									tableRow = $('.tr-load-detail').eq(index - 1);
									tableRow.find('td:first>input').val(r.Description);
									tableRow.find('td:nth-child(2)>input').val(r.ConnectorLoad);
									tableRow.find('td:nth-child(3)>input').val(r.SummerLoad);
									tableRow.find('td:nth-child(4)>input').val(r.WinterLoad);
									tableRow.find('td:nth-child(5)>input').val(r.Remarks);
									ConnectorLoad += parseFloat(r.ConnectorLoad);
									SummerLoad += parseFloat(r.SummerLoad);
									WinterLoad += parseFloat(r.WinterLoad);
								}
							});

							if (!(ConnectorLoad == 0 && SummerLoad == 0 && WinterLoad == 0)) {
								tableRow = $('.tr-load-detail:last').next();
								//tableRow.find('td:eq(2)>input').val(ConnectorLoad);
								//tableRow.find('td:eq(3)>input').val(SummerLoad);
								//tableRow.find('td:eq(4)>input').val(WinterLoad);
								tableRow.find('td:eq(1)>input').val(format( "#,##0.##0", ConnectorLoad));
								tableRow.find('td:eq(2)>input').val(format( "#,##0.##0", SummerLoad));
								tableRow.find('td:eq(3)>input').val(format( "#,##0.##0", WinterLoad));
							}
						}
					}
					
					//loadStampedSignatures();
					
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					alert("getLoad - error: " + errorThrown);
				});
		}
	
		//var errBox = '<input type="text" id="error-box" tabindex="-1" />';
		$('.forms').each(function() {
			if (this.id == _currentForm) {
				if (_formButtonSet === undefined) {
					//$(this).append(errBox);
					$(this).append($('#formButtonSet'));
					_formButtonSet = null;
					
					if ($('#formButtonSet').css("display") == "none")
						$('#formButtonSet').show();
				}  else if (_formButtonSet == null) {
					//$('#error-box').remove();
					//$(this).append(errBox);
					
					_formButtonSet = $('#formButtonSet').detach();
					_formButtonSet.appendTo($(this));
					_formButtonSet = null;
				}

				if ("main-form" == _currentForm)
					$('#add').show();
				else if ("load-form" == _currentForm)
					$('#add').hide();
				
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	});
	
	if (lang == "ar") {
		toggleLanguage('ar', 'rtl');
	} else {
		jQuery.i18n.properties({
			name:'Messages', 
			path:'bundle/', 
			mode:'both',
			language: 'en'
		});	
	}

	$(function() {
		//var divGrid = $('#divGrid'), main_form = $('#main-form'), flexslider_container = $('#flexslider-container'), userAssignmentDiv = $("#userAssignmentDiv");
		var divGrid = $('#divGrid'), main_form = $('#main-form'), report_container = $('#report-container'), flexslider_container = $('#flexslider-container'), userAssignmentDiv = $("#userAssignmentDiv");
		//$('.amazingslider-watermark-0').hide();
		//$('.amazingslider-bullet-wrapper-0').attr({dir: 'ltr'});

		//main_form.appendTo('#left-section');
		//amazingslider.appendTo('#left-section');
		
			
		$("#accordion").accordion({
			//active: false,
			collapsible: false,
			heightStyle: 'content',
			beforeActivate: function( event, ui ) {
				switch (ui.newHeader.index()) {
					case 0:
						divGrid.show();
						$('#' + _currentForm).hide();
						report_container.hide();
						flexslider_container.hide();
						userAssignmentDiv.hide();
						break;
					case 2:
						$("#" + $('#' + _currentForm).attr('data-link')).click();
//						$("#" + $('#main-form').attr('data-link')).click();
						//$('#' + $('#' + _currentForm).attr('data-link')).click();
						divGrid.hide();
						report_container.hide();
						flexslider_container.hide();
						userAssignmentDiv.hide();						
						break;
					case 4:
						//if (!$('#' + _currentForm).is(':visible'))
						//	$("#" + $('#' + _currentForm).attr('data-link')).click();
						
						$('#' + _currentForm).hide();
						
						var keyFieldValue = $("#" + $('#' + _currentForm).attr('data-key-field')).val();
						
						printReport(function(reportName) {
							$.blockUI();
							$('<img src=\"' + _jasperReportsURL + '?reportName=' + reportName + '&applicationNumber=' + _applicationNumber + '&keyFieldValue=' + keyFieldValue + '&renderAs=png\" onload="$.unblockUI()" />').appendTo('#report-container');
						});
						
						report_container.show();
						
						$("#signatureImages .drag").each(function() {
							$(this).draggable( "option", "disabled", false );
						})
					
						$(".dragclone").each(function() {
							$(this).attr('id').search(/([0-9]*)$/);
							var id = RegExp.$1;
							if ($(this).attr('id').search(_currentForm) != -1) {
								$('#sign' + id).draggable( "option", "disabled", true );
								//$(this).draggable( "option", "disabled", false );
								$('#sign' + id).droppable( { accept: '#' + $(this).attr('id')} );
								
								//$('#sign' + id).droppable( "option", "accept", '#' + $(this).attr('id'));
							}	
						})
					
						divGrid.hide();
						//$('#' + _currentForm).hide();
						flexslider_container.hide();
						userAssignmentDiv.hide();
						break;						
					case 6:
						(function() {
							if (_applicationNumber == "")
								return;
								
							url = "json_db_crud_pdo.php";
//data = {"param":{loginNames:JSON.stringify(json)}};
							$.get(url, {"func":"getAttachmentList", "param":{applicationNumber: _applicationNumber}})
								.done(function( data ) {
									if (isAjaxError(data))
										return;
								
									// if (data && data.constructor == Array) {
										// if (data[0] && data[0].error !== undefined) {
											// alert (data[0].error);
											// return;
										// }
									// }
									
									var o, result;
									if (data.d == undefined)
										result = data;
									else
										result = data.d.Data;
									
									$("#flexslider-container").append("<div class='slider'></div>");
									$(".slider").html(_slider);
									//$("#flexslider-container").html(_slider);
							
									
/*									
									//$('.amazingslider-thumbnails>li').each(function(index, li) {
									$('#carousel .slides>li').each(function(index, li) {
										if (index > 0)
											$(li).remove();
									})
*/
									$("#attachmentTitles>div").remove();
									var lastRow;
									var rand = Math.random();
									result.forEach(function(r, index) {
										//lastRow = $('<li><img src="" /></li>').appendTo('.amazingslider-thumbnails');
										//lastRow = $('<li><img src=\"get_attachments.php?applicationNumber=' + _applicationNumber + '&id=' + r.ID + '&thumb&rand=' + rand + '\" /></li>').appendTo('#carousel .slides');
										//$('<li><img src="images/kitchen_adventurer_lemon.jpg" /></li>').appendTo('#carousel .slides');
										//$('<li><img src="images/kitchen_adventurer_lemon.jpg" /></li>').appendTo('#slider .slides');
										$('<li><img src=\"fopen.php?applicationNumber=' + _applicationNumber + '&id=' + r.ID + '&thumb&rand=' + rand + '\" /></li>').appendTo('#carousel .slides');
										$('<li><img data-id=\"' + r.ID + '\" src=\"fopen.php?applicationNumber=' + _applicationNumber + '&id=' + r.ID + '&thumb&rand=' + rand + '\" /></li>').appendTo('#slider .slides');
										//r.ID = 56;
										//$('<li><img src=\"fopen.php?applicationNumber=' + _applicationNumber + '&id=' + r.ID + '&rand=' + rand + '\" /></li>').appendTo('#carousel .slides');
										//$('<li><img src=\"fopen.php?applicationNumber=' + _applicationNumber + '&id=' + r.ID + '&rand=' + rand + '\" /></li>').appendTo('#slider .slides');
										//var i = 5;
										//lastRow = $('.amazingslider-thumbnails>li:first').clone(true, true);
										//$('.amazingslider-thumbnails>li:first').after(lastRow);
										//lastRow.find('img').attr('src', 'get_attachments.php?param[applicationNumber]=' + _applicationNumber + "&thumb");

										$('<div><a href="#" data-id=\"' + index + '\">' + r.Title + '</a><br/></div>').appendTo("#attachmentTitles");
										
										//o = {};
										//o.id = r.ID;
//										areaNames.push(o);

										//areaNames.push(r.area_name);
									});

									$(function(){
									  $('#carousel').flexslider({
										animation: "slide",
										controlNav: false,
										animationLoop: false,
										slideshow: false,
										itemWidth: 160,
										itemMargin: 5,
										asNavFor: '#slider'
									  });

									  $('#slider').flexslider({
										animation: "slide",
										controlNav: false,
										animationLoop: false,
										slideshow: false,
										sync: "#carousel",
										start: function(slider){
										  $('body').removeClass('loading');
										}
									  });
									});

									$('#slider .slides img').on("click", function(event){
									//$('.flex-active-slide img').on("click", function(event) {
										var url = 'get_image.php?applicationNumber=' + _applicationNumber + '&id=' + this.getAttribute("data-id") + '&rand=' + rand;
										window.open(url, '_blank');

										//var win = window.open("", "_blank", "width=800, height=600, menubar=yes, toolbar=yes, location=yes, status=yes, scrollbars=auto, resizable=yes");
										//win.location.href = 'get_attachments.php?applicationNumber=' + _applicationNumber + '&id=' + '100' + '&rand=' + rand;
										//win.focus();
									});
									
									//$('.amazingslider-thumbnails').show();
								})
								.fail(function(jqXHR, textStatus, errorThrown) {
									alert("getAttachmentList - error: " + errorThrown);
								});
						
								$('#attachmentTitles>div>a').on("click", function(event){
									$('#slider').flexslider(parseInt(this.getAttribute("data-id")));
									//$('#carousel').flexslider(parseInt(this.getAttribute("data-id")));
									//alert(this.getAttribute("data-id"));
								});

								//$('#attachmentTitles').click();
						})();
						
						flexslider_container.show();
						divGrid.hide();
						$('#' + _currentForm).hide();
						report_container.hide();
						userAssignmentDiv.hide();
						break;
					case 8:
						divGrid.hide();
						$('#' + _currentForm).hide();
						report_container.hide();
						flexslider_container.hide();
						userAssignmentDiv.show();
						break;
				}
			}
		});
		
		disableAccordionTabs(true);
		//$($("#accordion > span")[2]).addClass( "ui-state-disabled" );
		//$($("#accordion > span")[3]).addClass( "ui-state-disabled" );
		//$(  "#accordion > h3" )[3]  ).removeClass( "ui-state-disabled" );
		
		$("#accordion").bind("keydown", function (event) {
			//var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode));
			var keycode = event.keyCode || event.which;

			if (keycode == 13) {
				//event.stopImmediatePropagation();
				//event.preventDefault();
				//$('#searchButton').click();
				$('#getPicture').triggerHandler( "click" );
				//document.getElementById(btnFocus).click();
			}
        });
	});

	(function() {
		url = "json_db_crud_pdo.php";

		$.get(url, {"func":"getAreas", "param":{}})
			.done(function( data ) {
				if (isAjaxError(data))
					return;
			
				// if (data && data.constructor == Array) {
					// if (data[0] && data[0].error !== undefined) {
						// alert (data[0].error);
						// return;
					// }
				// }
				
				areaNames = [];
				var o, result;
				if (data.d == undefined)
					result = data;
				else
					result = data.d.Data;
				
				//data.d.Data.forEach(function(o) {
				result.forEach(function(r) {
					o = {};
					o.id = r.ID;
					o.label = r.AreaName;
					areaNames.push(o);

					//areaNames.push(r.area_name);
				});
				
				
				//areaNames = [];
				//areaNames = [{label: 1, value: "kuku"}, {label: 2, value: "kuku2"}];
				//areaNames.push({label: 1, value: "kuku"});
				//areaNames.push({label: 12, value: "kuku2"});
				
				
	//			}
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				alert("getAreas - error: " + errorThrown);
			});
		
		var area = $('#area, #area_search');
		//var area = $('#area_search');
		var selectedItem;
		
		area.autocomplete({
			autoFocus: true,
			source: areaNames,
/*
			change: function( event, ui ) {
				//selectedItem = ui.content;
				if (selectedItem != undefined && selectedItem.length == 0) {
					selectedAreaId = -1;
				}
			},
			response: function( event, ui ) {
				selectedItem = ui.content;
				//if (ui.content.length == 1)
				if (ui.content[0] != undefined)
					selectedAreaId = ui.content[0].id;
			},
			select: function( event, ui ) {
				selectedAreaId = ui.item.id;
			},
			
			open: function( event, ui ) {
				var i = 0;
			},
			focus: function( event, ui ) {
				var i = 0;
			},
			create: function( event, ui ) {
				var i = 0;
			},
			search: function( event, ui ) {
				var i = 0;
			},
*/			
		});
		
		//$("#area_search").autocomplete({
		//	source: areaNames,
		//});
	})();
	
	$(".possibility").on("click", function(event){
		if (this.id == "possibility-yes") {
			//$(this).parent().siblings().children('input')).prop('checked', this.checked);
			$('#possibility-no').find(':checkbox').prop('checked', false);
		} else {
			$('#possibility-yes').find(':checkbox').prop('checked', false);		
			$('#station-number').val("");
		}
	});
	
	$("button")
		.button()
		.click(function( event ) {
			event.preventDefault();
		}
	);
/*
	$("#startService").button({
		icons: {primary: null},
		text: false
	})
	.on("click", function(event){
		$.get("startJasperReportsService.php")
			.done(function( data ) {
				if (data && data.constructor == Array) {
					if (data[0] && data[0].error != undefined) {
						alert (data[0].error);
						return;
					}
				}
			})
	});
*/	
	$("#add, #newForm, #editForm, #save, #print, #printForm, #delete").button({
		icons: {primary: null},
		text: false
	}) //.addClass('printButton')
	//.attr({target: '_blank', href: 'http://localhost:8084/TawsilatJasperReports/JasperServlet?ApplicationNumber=45678'});
	
	.on("click", function(event){
		if (this.id == "add") {
			clearForm();
		} else if (this.id == "newForm") {
			_currentForm = "main-form";
			$("#accordion").accordion( "option", "active", 1 );				
			clearForm();
		} else if (this.id == "save") {
			$.blockUI();
			if ("main-form" == _currentForm && $('#application-number').attr('readonly') == undefined ||
				"load-form" == _currentForm && $('#file-number').attr('readonly') == undefined)
				insertForm(this);
			else
				updateForm(this);
				
			$.unblockUI();
		} else {
			//var apn = $(this).parent().siblings('#application-number').val();
			var keyFieldValue = $("#" + $('#' + _currentForm).attr('data-key-field')).val();
			if (keyFieldValue != "") {
			//if (_applicationNumber != "") {
				if (this.id == "print" || this.id == "printForm") {
					printReport(function(reportName) {
						window.open(_jasperReportsURL + '?reportName=' + reportName + '&applicationNumber=' + _applicationNumber + '&keyFieldValue=' + keyFieldValue + '&renderAs=pdf', '_blank');
					});
				
				/*
					$.blockUI();
					_jasperReportsServerConnection = false;
					
					function onTimeOutHandler() {
						if ($('#error-box2').length > 0)
							$('#error-box2').remove();
					
						$.unblockUI();
						if (_jasperReportsServerConnection) {
							var ReportName;
							if ("main-form" == _currentForm)
								ReportName = "TawsilatApplicationForm";
							else
								ReportName = "TawsilatLoadForm";
								
							window.open('http://172.16.16.226:8084/TawsilatJasperReports/JasperServlet?ReportName=' + ReportName + '&ApplicationNumber=' + _applicationNumber + '&renderAs=pdf', '_blank');
						}
					}
					
					window.setTimeout(onTimeOutHandler, 5000);
					CheckConnection();
				*/
				} else if (this.id == "delete") {
					confirm("AreYouSure", null, function() {
						$.blockUI();
						deleteForm();
						$.unblockUI();
					});
				} else if (this.id == "editForm") {
					$("#accordion").accordion( "option", "active", 1 );				
				}
			}
		}
	});
/*	
	var lastRow, i;
	for (i = 0; i < 2; i++) {
		lastRow = $('.tr-application-detail:last').clone();
		$('.tr-application-detail:last').after(lastRow);
		lastRow = $('.tr-load-detail:first').clone();
		$('.tr-load-detail:first').after(lastRow);
	}
*/
	$("#sync").button({
		icons: {primary: null},
		text: false
	}).on("click", function(event){
		if (_rowId && _page)
			$("#grid").setGridParam({page:_page, current:true}).trigger('reloadGrid');
	});
	
	$(".addRow").button({
		icons: {primary: null},
		text: false
	}).on("click", function(event){
		var lastRow;
		if ("main-form" == _currentForm) {
			lastRow = $('.tr-application-detail:last').clone(true, true);
			$('.tr-application-detail:last').after(lastRow);
			lastRow.find("input[type='text']").val("");
		} else if ("load-form" == _currentForm) {
			lastRow = $('.tr-load-detail:last').clone(true, true);
			$('.tr-load-detail:last').after(lastRow);
			lastRow.find("input[type='text']").val("");
		}
		//setEventToDeleteRowButtons();
	});

	$(".deleteRow").button({
		icons: {primary: null},
		text: false
	});
	
	$("#add, .addRow, #newForm, #editForm, #save, #print, #printForm, #delete").on("mousedown", function(){
		$(this).animate({'top': '+=1px', 'left': '+=1px'}, 100);
	});

	$("#add, .addRow, #newForm, #editForm, #save, #print, #printForm, #delete").on("mouseup", function(){
		$(this).animate({'top': '-=1px', 'left': '-=1px'}, 100);
	});

	setEventToDeleteRowButtons();
	
/*		
	var lastRow, i;
	for (i = 0; i < 1; i++) {
		lastRow = $('.tr-application-detail:last').clone();
		$('.tr-application-detail:last').after(lastRow);
		lastRow = $('.tr-load-detail:first').clone();
		$('.tr-load-detail:first').after(lastRow);
	}
*/	
/*	
	var lastRow = $('#main-form table tr:last').clone();
	$('#main-form table tr:last').after(lastRow);
	lastRow = $('#main-form table tr:last').clone();
	$('#main-form table tr:last').after(lastRow);
	lastRow = $('#main-form table tr:last').clone();
	$('#main-form table tr:last').after(lastRow);
	lastRow = $('#main-form table tr:last').clone();
	$('#main-form table tr:last').after(lastRow);

	lastRow = $('#load-form table tr:nth-child(3)').clone();
	$('#load-form table tr:nth-child(3)').after(lastRow);
	lastRow = $('#load-form table tr:nth-child(3)').clone();
	$('#load-form table tr:nth-child(3)').after(lastRow);
	lastRow = $('#load-form table tr:nth-child(3)').clone();
	$('#load-form table tr:nth-child(3)').after(lastRow);
*/	
/*
	lastRow = $('#main-form table tr:last').clone();
	$('#main-form table tr:last').after(lastRow);
	lastRow = $('#main-form table tr:last').clone();
	$('#main-form table tr:last').after(lastRow);
	lastRow = $('#main-form table tr:last').clone();
	$('#main-form table tr:last').after(lastRow);
	lastRow = $('#main-form table tr:last').clone();
	$('#main-form table tr:last').after(lastRow);
	lastRow = $('#main-form table tr:last').clone();
	$('#main-form table tr:last').after(lastRow);
	lastRow = $('#main-form table tr:last').clone();
	$('#main-form table tr:last').after(lastRow);
	lastRow = $('#main-form table tr:last').clone();
	$('#main-form table tr:last').after(lastRow);
*/	
    //$grid = $('#myjqGrid');
	
	//$('#main-form, #load-form').html('<input type="text" id="error-box" />');	
	
	$("#left-section").append($("#divGrid"));
	$("#left-section").append($("#userAssignmentDiv"));
	$("#left-section").append($("#main-form"));
	$("#left-section").append($("#load-form"));
	$("#left-section").append($("#report-container"));
	
	_slider = $(".slider").html(); 
	$("#left-section").append($("#flexslider-container"));
	$(".slider").remove();
	
	if ($("#divGrid").css("display") == "none") {
		toggleGrid(lang);
		$("#divGrid").show();
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
/*
    $(function(){
      $('#carousel').flexslider({
        animation: "slide",
        controlNav: false,
        animationLoop: false,
        slideshow: false,
        itemWidth: 160,
        itemMargin: 5,
        asNavFor: '#slider'
      });

      $('#slider').flexslider({
        animation: "slide",
        controlNav: false,
        animationLoop: false,
        slideshow: false,
        sync: "#carousel",
        start: function(slider){
          $('body').removeClass('loading');
        }
      });
    });
*/	
	$('#accordion').show();
	//$('#flexslider-container').show();
		
	//$.get("startJasperReportsService.php");
		
	start(userLoginName, null);

});

function isAjaxError(data) {
	if (data && data.constructor == Array) {
		if (data[0] && data[0].error !== undefined) {
			alert (data[0].error);
			return true;
		}
	}
	
	return false;
}

/*
function delRowFunc(){
	//if ($('.tr-application-detail').length > 1) {
		//$(this).off();
		//$(this).off("click", delRowFunc);
		//$(this).off("mousedown", mouseDownFunc);
		//$(this).off("mouseup", mouseUpFunc);

		//$(this.parentNode.parentNode).remove();
	//}
	//else {
		//$('.tr-application-detail').find("input[type='text']").val("");
	//}
}

function mouseDownFunc(){
	$(this).animate({'top': '+=1px', 'left': '+=1px'}, 100);
}

function mouseUpFunc(){
	$(this).animate({'top': '-=1px', 'left': '-=1px'}, 100);
}
*/
function setEventToDeleteRowButtons() {
/*
	$(".deleteRow").each(function() {
		var data = $._data(this, 'events');
	
		$(this).off("click", delRowFunc);
		$(this).off("mousedown", mouseDownFunc);
		$(this).off("mouseup", mouseUpFunc);

		$(this).on("click", delRowFunc);
		$(this).on("mousedown", mouseDownFunc);
		$(this).on("mouseup", mouseUpFunc);
		
	})
	
	//$(".deleteRow").off("click", delRowFunc);
	//$(".deleteRow").off("mousedown", mouseDownFunc);
	//$(".deleteRow").off("mouseup", mouseUpFunc);

	//$(".deleteRow").on("click", delRowFunc);
	//$(".deleteRow").on("mousedown", mouseDownFunc);
	//$(".deleteRow").on("mouseup", mouseUpFunc);
*/	
/*
	$(".deleteRow").each(function() {
		var data = $._data(this, 'events');
		data = $._data(this, 'events');
	})

	$(".deleteRow").off();

	$(".deleteRow").each(function() {
		var data = $._data(this, 'events');
	
		$(this).on("click", delRowFunc);

		data = $._data(this, 'events');

		$(this).on("mousedown", mouseDownFunc);
		$(this).on("mouseup", mouseUpFunc);

		data = $._data(this, 'events');
		
	})
*/	
	
	$(".deleteRow").on("click", function(event){
		var parentNode = this.parentNode.parentNode;
		if ($('.' + $(parentNode).attr("class")).length > 1) {
			//$(this).off();
			$(parentNode).remove();
		}
		else {
			$(parentNode).find("input[type='text']").val("");
		}
	});

	//$(".deleteRow").each(function() {
	//	var data = $._data(this, 'events');
	//	data = $._data(this, 'events');
	//})
	
	$(".deleteRow").on("mousedown", function(){
		$(this).animate({'top': '+=1px', 'left': '+=1px'}, 100);
	});

	$(".deleteRow").on("mouseup", function(){
		$(this).animate({'top': '-=1px', 'left': '-=1px'}, 100);
	});
}	

function getAreaId(areaName) {
	var areaId = null;
	if (areaName != "") {
		areaNames.some(function(o){
			if (o.label == areaName) {
				areaId = o.id;
				return true;
			}
		});
	}
	return areaId;
}

function getAreaName(areaId) {
	var areaName = "";
	areaNames.some(function(o){
		if (o.id == areaId) {
			areaName = o.label;
			return true;
		}
	});
	return areaName;
}


function disableAccordionTabs(flag) {
	if (flag) {
		$($("#accordion > span")[2]).addClass( "ui-state-disabled" );
		$($("#accordion > span")[3]).addClass( "ui-state-disabled" );
	} else {
		$($("#accordion > span")[2]).removeClass( "ui-state-disabled" );
		$($("#accordion > span")[3]).removeClass( "ui-state-disabled" );
	}
}

function start(userLoginName, func) {
	rootDoc = null;
	rootActors = null;
	userInfo = [];

	getUserIdentities("GetUserInfo", [{loginName:userLoginName}], function() {
		var found = false;
		//$.get("actors.xml")    // sync request
		$.get('json_db_crud_pdo.php', {'func':'getActors'})
			.done(function(data) {
				if (isAjaxError(data))
					return;
				
				// if (data && data.constructor == Array) {
					// if (data[0] && data[0].error != undefined) {
						// alert (data[0].error);
						// return;
					// }
				// }
				
				//if (data.d == undefined)
				//	rootActors = data;
				//else
				//	rootActors = data.d.Data;

			//.success(function(data) {
				rootActors = data;
				if ($(data).find('department').attr('superuser') != undefined)
					_superuser = $(data).find('department').attr('superuser').split(',');
				else
					_superuser = [];
					
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
						if (!$("#jstree").hasClass("jstree"))
							userAssignment();

						loadUserSignatures();
						
						//initTabs();
						//getDocs();
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
				alert("getActors - error");
				//console.log("getActors - error");
			});
	});
}
	
function getUserIdentities(url, json, func) {
	var	contentType, data;
	contentType = "application/x-www-form-urlencoded; charset=UTF-8";
	if (idp == "AD") {
		contentType = "application/json; charset=utf-8";
		url = "ASPNetWebService.asmx/" + url;
		data = "{\"loginNames\":" + JSON.stringify(json) + "}";
	//} else if (idp == "LDAP" || (idp == "SAML" && idpSource == "AD")) {
	} else if (idp == "LDAP" || (idp == "SAML" && idpSource == "AD")) {
		//contentType = "application/x-www-form-urlencoded; charset=UTF-8";
		url = "ldap_repo.php";
		data = {"param":{loginNames:JSON.stringify(json)}};
	//} else if (idp == "SAML" && idpSource == "DB") {
	} else if (idp == "SAML" && idpSource == "DB") {
		//url = "get_user_attributes.php";
		//contentType = "application/x-www-form-urlencoded; charset=UTF-8";
		//data = {loginNames:JSON.stringify(json)};
		
		url = "json_db_crud_pdo.php";
		data = {"func":"getUserAttributes",	"param":{loginNames:JSON.stringify(json)}};
	} else {
		alert("Unknown user repository");
		return;
	}
	
	//url = "simpleSAMLSP.php";
	//var type = "GET";
	//var	data = "loginNames=" + JSON.stringify(json);
	//var	data = "loginNames=" + "{\"loginNames\":" + JSON.stringify(json) + "}";

	//var syncSuccess = false;
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
		//processData: true,
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			//alert($.parseJSON(XMLHttpRequest.responseText).Message);
			alert("Status: " + errorThrown);
		
			//loginName = $.parseJSON(this.data).loginName;
			//displayName = loginName;
			//syncSuccess = false;
			//asyncSuccess = false;
		},
		success: function(data) {
			//$('#userName').text($(data).text());	//xml response
			//$('#userName').text(data.d);			//json response
			//data.d.Data[0].Groups[1].toString();
			//data.d.Data[0].Groups.length;
			//loginName = data.d.Data[0].LoginName;
			//displayName = data.d.Data[0].DisplayName;
			if (data && data.constructor == Array) {
				if (data[0] && data[0].error !== undefined) {
					if (data[0].error == "1008")
						if (json[0] != undefined)
							alert((jQuery.i18n.prop("UserDoesNotExist")).format(json[0].loginName));
						else
							alert("Unknown user");
					else
						alert(data[0].error);
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
			//syncSuccess = true;
			
			func();
		}
	});
	//return syncSuccess;
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
			//$("#jstree").detach();
			//$("#newForm").detach();
			//$("#tabs").detach();

			$("#userAssignmentDiv").css("display", "none");
			//$("#userList").css("display", "none");
			//$("#jstree").css("display", "none");
			//$("#newForm").css("display", "none");
			
			//$("body").append($("#userAssignmentDiv"));
			//$("body").append($("#userList"));
			//$("body").append($("#jstree"));
			//$("body").append($("#newForm"));
			
			start(val, function() {
				$("#accordion").accordion( "option", "active", 0 );				
			
				var found = false;
				_superuser.some(function(name) {
					if (userInfo[0].loginName == name) {
						$("#jstree>ul>li").show();
						//$("#jstree").jstree("open_all");
						//$("#jstree").jstree("open_node", $("#jstree>ul>li"));	//doesn't work
						$("#jstree>ul>li").each(function(i) {
							$("#jstree").jstree("open_node", this);
						})
						found = true;
						return true;
					}
				})

				if (!found) {
					$("#jstree").jstree("close_all");
					$("#jstree>ul>li").each(function(i) {
						if (sectionId == $(this).attr('id')) {
							$('#jstree').jstree("open_node", $("#jstree>ul>li:nth-child(" + (i + 1) + ")"));
							$("#jstree>ul>li:nth-child(" + (i + 1) + ")").show();
						} else
							$("#jstree>ul>li:nth-child(" + (i + 1) + ")").hide();
					})

					/*
					//jQuery.jstree._reference('#jstree').close_all($("#jstree"));
					var tree_size = $("#jstree>ul>li").length;
					for (var i = 0; i < tree_size; i++) {
						if (i == actorSectionNumber) {
							$('#jstree').jstree("open_node", $("#jstree>ul>li:nth-child(" + (i + 1) + ")"));
							$("#jstree>ul>li:nth-child(" + (i + 1) + ")").show();
						} else
							$("#jstree>ul>li:nth-child(" + (i + 1) + ")").hide();
					}
					*/
				}
			});
		}, 10);
	});
}

function loadUserSignatures() {
	url = "json_db_crud_pdo.php";

	$.get(url, {"func":"getUserSignatureList", "param":{"currentuser": userInfo[0].loginName}})
		.done(function( data ) {
			if (isAjaxError(data))
				return;
		
			// if (data && data.constructor == Array) {
				// if (data[0] && data[0].error != undefined) {
					// alert (data[0].error);
					// return;
				// }
			// }
			
			var o, result;
			if (data.d == undefined)
				result = data;
			else
				result = data.d.Data;
			
			$("#signatureImages div").remove();
			
			if (result.length == 0)
				return;
			
			var lastRow;
			var rand = Math.random();
			result.forEach(function(r, index) {
				$('<div class="drag" id="sign' + r.ID + '"><li><img class="img-signature" data-id="' + r.ID + '" src="fopen.php?id=' + r.ID + '&rand=' + rand + '" /></li></div>').appendTo('#signatureImages');

				//$('.img-signature2').css({
				$('#sign' + r.ID).css({
						"height": r.Height * 72 / r.Resolution,
						"width": r.Width * 72 / r.Resolution,
					});
				
			});

			//$("#signatureImages").droppable( { accept: '.dragclone'} );
			$("#signatureImages>div").draggable({containment: "document", helper: "clone", revert: "invalid", cursor: "auto", scroll: false, opacity: 0.7,
				stop: function (ev, ui) {
					var target = "#report-container";
					var pos = $(ui.helper).offset();
					var pos2 = $(target).offset();
					//var pos2 = $('#' + _currentForm).offset();
					//var pos2 = $('#' + _currentForm).offset();
					objName = '#' + _currentForm + ui.helper.find('img').attr('data-id');
					//objName = '#' + ui.helper.find('img').attr('data-id');

					if ($(objName).length == 0)
						return;
						
					$(objName).css({
						"left": pos.left - pos2.left,
						"top": pos.top - pos2.top,
						"position": "absolute"
					});

					//var percentTop = ((pos.top - pos2.top) * 100) / $(target).height();
					//var percentLeft = ((pos.left - pos2.left) * 100) / $(target).width();
					//var percentTop = ((pos.top - pos2.top) * 100) / $('#' + _currentForm).height();
					//var percentLeft = ((pos.left - pos2.left) * 100) / $('#' + _currentForm).width();
					
					//saveSignature(ui.helper.find('img').attr('data-id'), percentHeght, percentWidth);
					//saveSignature(ui.helper.find('img').attr('data-id'), pos.top - pos2.top, pos.left - pos2.left, percentTop, percentLeft);
					saveSignature(ui.helper.find('img').attr('data-id'), pos.top - pos2.top, pos.left - pos2.left);

					$(objName).draggable({
						containment: "document", revert: "invalid", cursor: "auto", scroll: false,
						stop: function (ev, ui) {
							var target = "#report-container";
							var pos = $(ui.helper).offset();
							var pos2 = $(target).offset();
							//var pos2 = $('#' + _currentForm).offset();
							//var percentTop = ((pos.top - pos2.top) * 100) / $(target).height();
							//var percentLeft = ((pos.left - pos2.left) * 100) / $(target).width();
					
							//saveSignature(ui.helper.find('img').attr('data-id'), percentHeght, percentWidth);							
							//saveSignature(ui.helper.find('img').attr('data-id'), pos.top - pos2.top, pos.left - pos2.left, percentTop, percentLeft);
							saveSignature(ui.helper.find('img').attr('data-id'), pos.top - pos2.top, pos.left - pos2.left);
						}
					});
					
				}
			});

			$("#report-container").droppable({
				drop: function( event, ui ) {
					ui.draggable.attr('id').search(/sign([0-9]*)/);
					var elementId = _currentForm + RegExp.$1;
					//if (ui.draggable.hasClass('drag')) {
					if (!ui.draggable.hasClass('dragclone') && $(this).find('#' + elementId).length == 0) {
					//if ($('#' + elementId).length == 0) {
						//ui.draggable.removeClass("drag");
						var element = $(ui.draggable).clone();
						ui.draggable.attr('id').search(/sign([0-9]*)/);
						var elementId = _currentForm + RegExp.$1;
						element.attr("id", elementId);
						element.find('img').css({
							"height": element.css('height'),
							"width": element.css('width'),
						});
						
						element.addClass("dragclone");
						$(this).append(element);
						$(ui.draggable).draggable( "option", "disabled", true );
						
						setUserSignatureAsDroppable(ui.draggable, elementId);
					}
				}
			});
			
			//$("#signatureImages div").on("mousedown", function(){
			//	$(this).animate({'top': '+=1px', 'left': '+=1px'}, 100);
			//});

			//$("#signatureImages div").on("mouseup", function(){
			//	$(this).animate({'top': '-=1px', 'left': '-=1px'}, 100);
			//});

			//$('#signatureImages img').on("click", function(event){
			//	$('<div class="certificate-images"><img src="images/certificate.png" />' +
			//	'<a class="tooltip-for-image" href=""><span><img src="fopen.php?id=' + this.getAttribute("data-id") + '" /></span></a></div>').appendTo('#' + _currentForm);
			//});
			
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			alert("getUserSignatureList - error: " + errorThrown);
		});
}

function loadStampedSignatures() {
	//if ($('#' + _currentForm + ' .dragclone').length != 0)
	//	return;
/*		
	$(".dragclone").each(function() {
		$(this).attr('id').search(/([0-9]*)$/);
		var id = RegExp.$1;
		if ($(this).attr('id').search(_currentForm) != -1) {
			$('#sign' + id).draggable( "option", "disabled", true );
			$('#sign' + id).droppable( { accept: '#' + $(this).attr('id')} );
			
			//$('#sign' + id).droppable( "option", "accept", '#' + $(this).attr('id'));
		}	
	})
*/		
		
	var target = "#report-container";

	//$(target + ' .dragclone').remove();
	$(target + ' div').remove();
	//$('#' + _currentForm + ' .dragclone').remove();
	$.get("json_db_crud_pdo.php", {'func':'getStampedSignatures',
		'param': {
			'schema': _currentForm,
			'data-key-field' : $('#' + _currentForm).attr('data-key-field'),
			'data-key-field-val' : $('#' + $('#' + _currentForm).attr('data-key-field')).val(),
			}
		})
		.done(function( data ) {
			if (isAjaxError(data))
				return;
		
			// if (data && data.constructor == Array) {
				// if (data[0] && data[0].error != undefined) {
					// alert (data[0].error);
					// return;
				// }
			// }
			
			//$('#' + _currentForm + ' .dragclone')
			var element;
			var rand = Math.random();
			data.forEach(function(r, index) {
				if ($('#sign' + r.SignatureID).length != 0) {
					$('#sign' + r.SignatureID).draggable( "option", "disabled", false );
					element = $('#sign' + r.SignatureID).clone();
					element.attr("id", _currentForm + r.SignatureID);
					element.addClass("dragclone");
					
					//var formWidth = document.getElementById(_currentForm).style.width;
						//"left": ($('#' + _currentForm).width() * r.LeftPos / 100).toString() + "px",
						//"top": $('#' + _currentForm).height() * r.TopPos / 100 + "px",
					element.css({
						"left": r.LeftPos + "px",
						"top": r.TopPos + "px",
						"position": "absolute"
					});
					
					element.find('img').css({
						"height": r.Height * 72 / r.Resolution,
						"width": r.Width * 72 / r.Resolution,
					});
					
					$(target).append(element);
					//$('#' + _currentForm).append(element);
					
					element.draggable({
						containment: "document", revert: "invalid", cursor: "auto", scroll: false,
						stop: function (ev, ui) {
							//var target = "#report-container";
							var pos = $(ui.helper).offset();
							var pos2 = $(target).offset();
							//var pos2 = $('#' + _currentForm).offset();
							
							//var percentTop = ((pos.top - pos2.top) * 100) / $(target).height();
							//var percentLeft = ((pos.left - pos2.left) * 100) / $(target).width();
						
							//saveSignature(ui.helper.find('img').attr('data-id'), percentHeght, percentWidth);							
							//saveSignature(ui.helper.find('img').attr('data-id'), pos.top - pos2.top, pos.left - pos2.left, percentTop, percentLeft);
							saveSignature(ui.helper.find('img').attr('data-id'), pos.top - pos2.top, pos.left - pos2.left);
						}
					});
					
					setUserSignatureAsDroppable($('#sign' + r.SignatureID), _currentForm + r.SignatureID);
				} else {
					$('<div id="foreign' + r.SignatureID + '"><li><img class="img-signature" data-id="' + r.SignatureID + '" src="fopen.php?id=' + r.SignatureID + '&rand=' + rand + '" /></li></div>').appendTo(target);

					$('#foreign' + r.SignatureID).css({
						"left": r.LeftPos + "px",
						"top": r.TopPos + "px",
						"height": r.Height * 72 / r.Resolution,
						"width": r.Width * 72 / r.Resolution,
						"position": "absolute"
					});
				}
				
				//$('#sign' + r.SignatureID).draggable( "option", "disabled", true );
				//objName = '#' + _currentForm + r.SignatureID;
				//$(objName).css({
			});
		});
}


function setUserSignatureAsDroppable(ui, cloneId) {
	ui.droppable({ accept: '#' + cloneId,
		drop: function( event, ui ) {
			$.post("json_db_crud_pdo.php", {'func':'deleteSignature',
				'param': {
					'schema': _currentForm,
					'data-key-field' : $('#' + _currentForm).attr('data-key-field'),
					'data-key-field-val' : $('#' + $('#' + _currentForm).attr('data-key-field')).val(),
					'signature-id': ui.draggable.find('img').attr('data-id'),
					}
				})
				.done(function( data ) {
					if (isAjaxError(data))
						return;
				
					// if (data && data.constructor == Array) {
						// if (data[0] && data[0].error != undefined) {
							// alert (data[0].error);
							// return;
						// }
					// }
				});

			//$(this).attr('id').search(/sign([0-9]*)/);
			//var rg = RegExp.$1;
			//if (ui.draggable.find('img').attr('data-id') == rg) {
			$(ui.draggable).remove();
				//$(this).addClass("drag");
			$(this).draggable( "option", "disabled", false );
			//}
		}
	});
}

function saveSignature(id, top, left) {
	$.post("json_db_crud_pdo.php", {'func':'saveSignature',
		'param': {
			'schema': _currentForm,
			'data-key-field' : $('#' + _currentForm).attr('data-key-field'),
			'data-key-field-val' : $('#' + $('#' + _currentForm).attr('data-key-field')).val(),
			'signature-id': id,
			'employee-name': userInfo[0].displayName,
			'top-pos': top,
			'left-pos': left,
			}
		})
		.done(function( data ) {
			if (isAjaxError(data))
				return;
		
			// if (data && data.constructor == Array) {
				// if (data[0] && data[0].error != undefined) {
					// alert (data[0].error);
					// return;
				// }
			// }
		});
}


function setRadioButton(groupName, value) {
	if (value != null && value != -1 && $('input:radio[name=' + groupName + ']').length > value)
		$('input:radio[name=' + groupName + ']')[value].checked = true;
}

function setCheckBox(groupName, value, bitmask) {
	//if (value != null && value != -1) {
	if (value != null && value != 0) {
		$('input:checkbox[name=' + groupName + ']').each(function(index) {
			if (value & bitmask)
				$('input:checkbox[name=' + groupName + ']')[index].checked = true;
			bitmask >>= 1;
		});
		//$('input:checkbox[name=' + groupName + ']')[value].checked = true;
	}
}

function printReport(func) {
	error("");
	$.blockUI();
	_jasperReportsServerConnection = false;
	
	function onTimeOutHandler() {
		//if ($('#error-box2').length > 0)
		//	$('#error-box2').remove();
	
		$.unblockUI();
		if (_jasperReportsServerConnection) {
			//showError("");
//			error("");
			var reportName;
			if ("main-form" == _currentForm)
				reportName = "TawzeeApplicationForm";
			else
				reportName = "TawzeeLoadForm";
			
			func(reportName);
			
			//window.open('http://172.16.16.226:8084/TawsilatJasperReports/JasperServlet?ReportName=' + ReportName + '&ApplicationNumber=' + _applicationNumber + '&renderAs=pdf', '_blank');
		} //else
			//$.unblockUI();
	}
	
	var timeoutID = window.setTimeout(onTimeOutHandler, 5000);
	CheckConnection(timeoutID, onTimeOutHandler);
	//if (_jasperReportsServerConnection) {
	//	window.clearTimeout(timeoutID);
	//	onTimeOutHandler();
	//}
}

function CheckConnection(timeoutID, func) {
/*
	var errBox;
	//if ($('#divGrid').filter( ":visible" )) {
	if ($('#divGrid').css('display') != 'none') {
		$('#divGrid').append('<input type="text" id="error-box2" tabindex="-1" />');
		errBox = $('#error-box2');
	} else {
		errBox = $('#error-box');
	}
*/
	//errBox.val("");

	//$('#error-box').val("");

	//var xhrTimeout = window.setTimeout(onTimeOutHandler, 5000);
	
	//var retCode = false;
	//var xhrTimeout;
/*	
	function onLoadHandler() {
		if (xhr.status != 200) {
			$('#error-box').val("Error connecting to Jetty Reporting Service: " + xhr.status);
			return false;
		}
		return true;
	}
	
	function onTimeOutHandler() {
		xhr.abort();
		clearTimeout(xhrTimeout);
		$('#error-box').val("Error connecting to Jetty Reporting Service (timeout)");	
	}
*/	
	//var xhr;
	var xhr = new XMLHttpRequest();
	//try {
	var url = _jasperReportsURL + "?CheckConnection&r=" + Math.random();
	xhr.open( "GET", url, true ); 	// true - the asynchronous operation 
	//xhrTimeout = window.setTimeout(onTimeOutHandler, 5000);

	xhr.onload = function(e) {
		//showError("");	
		error("");	
		if (xhr.status != 200) {
			//showError("Error connecting to Jetty Reporting Service: " + xhr.status);
			error("Error connecting to Jetty Reporting Service: " + xhr.status);
			//errBox.val("Error connecting to Jetty Reporting Service: " + xhr.status);
			//$('#error-box').val("Error connecting to Jetty Reporting Service: " + xhr.status);
			//return false;
		} else {
			_jasperReportsServerConnection = true;
			window.clearTimeout(timeoutID);

			func();
		}
	}
	
	xhr.onerror = function() {
		//showError("Jetty Reporting Service is not running");
		error("Jetty Reporting Service is not running");
	};
	
	xhr.timeout = 3000;
	xhr.ontimeout = function () {
		xhr.abort();
		//clearTimeout(xhrTimeout);
		//showError("Jetty Reporting Service is not running");
		error("Jetty Reporting Service is not running");
		//$('#error-box').val("Check if Jetty Reporting Service started");
		//return false;
	}
	/*
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 0) {
			errBox.val("Check if Jetty Reporting Service started");
		// JSON.parse does not evaluate the attacker's scripts.
		//var resp = JSON.parse(xhr.responseText);
		}
	}
	*/
	xhr.send();

	//wait(5000);
	//return retCode;
	//alert("Status: " + xmlHttp.status);
	//if (xhr.status != 200) {
	//	$('#error-box').val("Error connecting to Jetty Reporting Service: " + xhr.status);
	//	return false;
	//}
	//} catch (e) {
	//		errBox.val("Check if Jetty Reporting Service started");
//	//$.post("json_db_crud_pdo.php", {"func": "startWebServer"});
//	$('#error-box').val("Check if Jetty Reporting Service started");
//	return false;	
	//}

//return true;
}

//function showError(error) {
function error(error) {
	if (error == "") {
		if ($('#error-box').length != 0)
			$('#error-box').remove();
	} else {
		if ($('#error-box').length == 0)
			$('#left-section').append('<input type="text" id="error-box" tabindex="-1" />');
		
		$('#error-box').val(error);
	}
	
/*	
	var errBox;
	//if ($('#divGrid').filter( ":visible" )) {
	if ($('#divGrid').css('display') != 'none') {
		$('#divGrid').append('<input type="text" id="error-box2" tabindex="-1" />');
		errBox = $('#error-box2');
	} else {
		errBox = $('#error-box');
	}
	
	errBox.val(error);
*/	
}


userAssignment = function() {
	$(function() {
		fillUserList();
		
		if ($("#jstree").hasClass("jstree")) {
			$("#jstree").jstree('destroy').empty();
			//$("#jstree>ul").remove();
			$("#jstree").append('<ul></ul>');
		}

		var managers, employees, val;

		$(rootActors).find('section').each(function(section_index) {
			$("#jstree>ul").append('<li id="' + $(this).attr('id') + '"><a href="#">' + (($("body[dir='ltr']").length) ? $(this).attr('name') : $(this).attr('arName')) + '</a></li>');
			//$("#jstree>ul").append('<li class="jstree-drop" id="' + $(this).attr('id') + '"><a href="#">' + (($("body[dir='ltr']").length) ? $(this).attr('name') : $(this).attr('arName')) + '</a></li>');
			//$("#jstree>ul").append('<li rel="department" id="' + $(this).attr('id') + '"><a href="#">' + (($("body[dir='ltr']").length) ? $(this).attr('name') : $(this).attr('arName')) + '</a></li>');
			//$("#jstree>ul").append('<li data-jstree=\'{"icon":"images/users.png"}\' id="' + $(this).attr('id') + '"><a href="#">' + (($("body[dir='ltr']").length) ? $(this).attr('name') : $(this).attr('arName')) + '</a></li>');

			managers = $(this).find('manager');
			if (managers.length != 0) {
				$("#jstree>ul>li:last-child").append('<ul></ul>');
				managers.each(function(manager_index) {
					val = $(this).attr('name');
					
					userInfo.every(function(o) {
						if (o.loginName == val) {
							val = o.displayName;
							return false;
						}
						return true;			//?????
					});

					//$("#jstree>ul>li:last-child>ul").append('<li rel="employee"><a href="#">' + val + '<span class="userListHiddenElement">' + $(this).attr('name') + '</span></a></li>');
					//$("#jstree>ul>li:last-child>ul").append('<li data-jstree=\'{"icon":"images/user.png"}\'><a href="#">' + val + '<span class="userListHiddenElement">' + $(this).attr('name') + '</span></a></li>');
					//$("#jstree>ul>li:last-child>ul").append('<li class="jstree-drop" data-jstree=\'{"type":"employee"}\'><a href="#">' + val + '<span class="userListHiddenElement">' + $(this).attr('name') + '</span></a></li>');
					//$("#jstree>ul>li:last-child>ul").append('<li data-jstree=\'{"type":"employee"}\'><a href="#">' + val + '<span class="userListHiddenElement">' + $(this).attr('name') + '</span></a></li>');
					$("#jstree>ul>li:last-child>ul").append('<li data-jstree=\'{"type":"employee"}\' data-loginname="' + $(this).attr('name') + '"><a href="#">' + val + '</a></li>');
					employees = $(this).find('employee');
					if (employees.length != 0) {
						$("#jstree>ul>li:last-child>ul>li:last-child").append('<ul></ul>');
						employees.each(function(employee_index) {
							val = $(this).text();

							userInfo.some(function(o) {
								if (o.loginName == val) {
									val = o.displayName;
									return true;
								}
								return false;
							});

							//$("#jstree>ul>li:last-child>ul>li:last-child>ul").append('<li rel="employee"><a href="#">' + val + '<span class="userListHiddenElement">' + $(this).text() + '</span></a></li>');
							//$("#jstree>ul>li:last-child>ul>li:last-child>ul").append('<li data-jstree=\'{"icon":"images/user.png"}\'><a href="#">' + val + '<span class="userListHiddenElement">' + $(this).text() + '</span></a></li>');
							//$("#jstree>ul>li:last-child>ul>li:last-child>ul").append('<li data-jstree=\'{"type":"employee"}\'><a href="#">' + val + '<span class="userListHiddenElement">' + $(this).text() + '</span></a></li>');
							$("#jstree>ul>li:last-child>ul>li:last-child>ul").append('<li data-jstree=\'{"type":"employee"}\' data-loginname="' + $(this).text() + '"><a href="#">' + val + '</a></li>');
						})
					}
				})
			}
		})

		//$("#userList>ul>li").draggable({helper: "clone", cursor: "move", revert: "valid", scroll: false, opacity: 0.7, zIndex: 100  });
		//$("#userList>div>div").draggable({helper: "clone", cursor: "move", revert: "valid", scroll: false, opacity: 0.7, zIndex: 100  });
		//$("#sortable>ul").disableSelection();
		
		$("#userList").jstree({
			"core" : {
				//"themes" : { "stripes" : true },
				"multiple" : false,
				"check_callback" : function (operation, node, node_parent, node_position, more) {
					//console.log(operation);
					switch(operation) {
						case "delete_node":
							return true;
							break;
						default:
							return false;
					}
				}
			},
			"contextmenu" : {         
				"items": function($node) {
					var tree = $("#userList").jstree(true);
					return {
						"Remove": {
							"separator_before": false,
							"separator_after": false,
							"label": "Remove",
							"action": function (obj) { 
								tree.delete_node($node);
							}
						}
					};
				}
			},
			"dnd" : {
				"always_copy" : true,
			},
			"types" : {
				"default" : {
					"icon" : "images/user.png"
				}
			},
			"themes" : {
				//"theme" : "classic",
				"stripes" : true,
				"dots" : true,
				"icons" : true
			},
			
			"plugins" : [ "dnd", "types", "themes", "contextmenu" ]
			//"plugins" : [ "dnd", "types", "wholerow" ]
		});

		$(document).bind('dnd_stop.vakata', function (e, data) {
			//saveActors();

/*		
				if ($(data.event.target).hasClass("jstree-anchor")) {
					console.log($(this).text());

					var exit = false;
					var node = $("#jstree");
					$(node).find('ul li a>span').each(function() {
						if ($(this).text() == $(data.element).children('span').text()) {
							exit = true;
							return false;
						}
					});
					
					if (exit)
						return false;
				}
*/				
			})
		
		$("#jstree")
			//.bind("loaded.jstree", function (e, data) {
			.on("ready.jstree", function (e, data) {
				//$("#userAssignmentDiv").show();
/*				
				var userList = $("#userList");
				var mainTree = $("#jstree");
				var mainNodes = mainTree.jstree(true).get_json("#", {flat:true});
				var userNodes = userList.jstree(true).get_json("#", {flat:true});
				mainNodes.forEach(function(om) {
					if (om.data.loginname != undefined) {
						userNodes.some(function(ou) {
							if (om.data.loginname == ou.data.loginname) {
								userList.jstree(true).disable_node(ou);
								return true;
							}
						})
					}
				})
*/
				var found = false;
				_superuser.some(function(name) {
					if (userInfo[0].loginName == name) {
						//$("#jstree").jstree("open_all");
						//$("#jstree").jstree("open_node", $("#jstree>ul>li"));	//doesn't work
						$("#jstree>ul>li").each(function(i) {
							$("#jstree").jstree("open_node", this);
						})
						found = true;
						return true;
					}
				})

				if (!found) {
					$("#jstree>ul>li").each(function(i) {
						if (sectionId == $(this).attr('id')) {
							$('#jstree').jstree("open_node", $("#jstree>ul>li:nth-child(" + (i + 1) + ")"));
						} else
							$("#jstree>ul>li:nth-child(" + (i + 1) + ")").hide();
					})						
				}
			})
			.on("copy_node.jstree", function (e, data) {
				data.node.data = $.extend(true, {}, data.original.data);
				saveActors();
			})
			.on("rename_node.jstree", function (e, data) {
				saveActors();
			})
			.on("delete_node.jstree", function (e, data) {
				saveActors();
			})
			
/*			
			.on("select_node.jstree", function (e, data) {
				$('#addUserButton').focus();
			})
			.on("before.jstree", function (e, data) {
			})
			.on("rename.jstree", function (e, data) {
				saveActors();
					//alert(data.rslt.new_name);
					e.stopImmediatePropagation();
					return false;
			})
			.on("remove.jstree", function (e, data) {
				e.stopImmediatePropagation();
				saveActors();
				//alert(data.rslt.new_name);
				return false;
			})
*/			
			.jstree({
				"core" : {
					"multiple" : false,
					"themes" : { "stripes" : true },
					"check_callback" : function (operation, node, node_parent, node_position, more) {
						console.log(operation);
						switch(operation) {
							case "move_node":
								return false;
							case "copy_node":
								if (node.data == null)
									return false;
							
								var exit = false;
								//var rootnodes = this.element;
								var nodes = this.element.jstree(true).get_json("#", {flat:true});
								nodes.forEach(function(o) {
									if (o.data.loginname == node.data.loginname) {
										exit = true;
										return false;
									}
								})

/*								
								$(rootnodes).find('li').each(function() {
									if ($(this).data('loginname') != undefined) {
										if ($(this).data('loginname') == node.data.loginname) {
											exit = true;
											return false;
										}

										if ($(this).hasClass('jstree-closed')) {
											var closednode = rootnodes.jstree(true).get_json(this.id, {flat:false});
											closednode.children.forEach(function(o) {
												if (o.data.loginname == node.data.loginname) {
													exit = true;
													return false;
												}
											})
										}
									}
								});
*/								
								if (exit)
									return false;
									
								if (node_parent.parents.length == 0 || node_parent.parents.length > 2)
									return false;

								return true;
								break;
							case "delete_node":
								//this.element.jstree(true).delete_node(node);
								//this.element.jstree('remove_node', node);
								break;
							case "rename_node":
								//this.element.jstree('rename_node', [node , "texthhh"]);
								break;
						}
					
					}
					//"initially_open" : [ "Follow Up", "AC" ] 
				},
				"contextmenu" : {         
					"items": function(node) {
						var tree = $("#jstree").jstree(true);

						//return {
						var items = {
							create : {
								"separator_before": false,
								"separator_after": false,
								"label": "Create",
								"action": function (obj) { 
									node = tree.create_node(node);
									tree.edit(node);
								}
							},
							rename: {
								"separator_before": false,
								"separator_after": false,
								"label": "Rename",
								"action": function (obj) { 
									tree.edit(node);
								}
							},                         
							remove: {
								"separator_before": false,
								"separator_after": false,
								"label": "Remove",
								"action": function (obj) { 
									tree.delete_node(node);
								}
							}
						};
						
						if (node.data != null && node.data.loginname == undefined) {
							delete items.remove;
						} else {
							delete items.rename;
							delete items.create;
						}

						return items;
					}
				},
/*				
				"dnd" : {
					"check_while_dragging" : true,

					"drop_finish" : function () { 
						alert("DROP"); 
					},
					"drag_check" : function (data) {
						var exit = false;
						var node = $("#jstree");
						$(node).find('ul li a>span').each(function() {
							if ($(this).text() == $(data.o).children('span').text()) {
								exit = true;
								return false;
							}
						});
						
						if (exit)
							return false;
						
						if ($(data.r).parentsUntil("#jstree", "li").length > 1)
							return false;

						//if (exit)
						//	return false;
							
						return { 
							after : false, 
							before : false, 
							inside : true 
						};
					},
					"drag_finish" : function (data) { 
						//data.r[0].children[1].text = data.o.innerHTML;
						var node = data.r;
						
						//var liNodes = $(node).closest("li", "#jstree").length;
						if ($(node).parentsUntil("#jstree", "li").length < 2) {
							this.create_node(node, "first", {data: data.o.childNodes[0].textContent }, false, false);
							//$(node).find('ul>li').attr('rel', 'employee');
							//$(node).find('ul>li').attr('data-jstree', '{"icon":"images/user.png"}');
							$(node).find('ul>li').attr('data-jstree', '{"type":"employee"}');
							$(node).find('ul>li').attr('data-loginname', data.o.childNodes[1].textContent);
							//$(node).find('ul>li:first>a').append('<span class="userListHiddenElement">' + data.o.childNodes[1].textContent + '</span>');

							saveActors();
						}
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
					},
					"del" : function () {
						if (this.is_selected()) {
							if (this._get_parent(this._get_node()) != -1) {
								//this.remove();
								//var nod = $(this).jstree('get_node', this);
								confirm("AreYouSure", this, function(that) {
									that.remove();
									//data.inst.delete_node(data.inst);
									//$('#jstree').jstree('delete_node', nod);
								});
								
								
							}
						}
					}
				},
				
				"themes" : {
					"theme" : "classic",
					"dots" : true,
					"icons" : true
				},
*/				
				"types" : {
					//"#" : {
					//	  "max_children" : 1, 
					//	  "max_depth" : 4, 
					//	  "valid_children" : ["department"]
					//	},
				
					//"types" : {
						"department" : {
							"icon" : "images/users.png",
							"valid_children" : []
							//"icon" : {
							//	"image" : "images/users.png"
							//}
						},
						"employee" : {
							"icon" : "images/user.png"
						}
					//}
				},
				
				"plugins" : [ "themes", "dnd", "types", "contextmenu" ]
				//"plugins" : [ "themes", "html_data", "ui", "crrm", "hotkeys", "dnd", "types" ]
			});
	})
};

saveActors = function() {
	var department, section, mamagers, manager, employee;
	var department = xmlHelper.createElementWithAttribute("department", 'superuser', $(rootActors).find('department').attr('superuser'));
	xmlHelper.appendNewLineElement(department, 1);
	var sections = document.createElementNS("", "sections");
	department.appendChild(sections);
	var nodes = $('#jstree').jstree(true).get_json("#", {flat:false});
	var name, arName;
	$(nodes).each(function() {
		xmlHelper.appendNewLineElement(sections, 2);
		section = xmlHelper.createElementWithAttribute("section", 'id', this.id);
		if ($("body[dir='ltr']").length) {
			name = this.text.trim();
			arName = $(rootActors).find('section[id="' + this.id + '"]').attr('arName');
		} else {
			name = $(rootActors).find('section[id="' + this.id + '"]').attr('name');
			arName = this.text.trim();
		}

		xmlHelper.appendAttributeToElement(section, 'name', name);
		xmlHelper.appendAttributeToElement(section, 'arName', arName);

		sections.appendChild(section);
		xmlHelper.appendNewLineElement(section, 3);
		managers = document.createElementNS("", "managers");
		section.appendChild(managers);
		//$(this).siblings('ul').children('li').children('a').each(function(index) {
		$(this.children).each(function() {
			xmlHelper.appendNewLineElement(managers, 4);
			manager = xmlHelper.createElementWithAttribute("manager", 'name', this.data.loginname);
			managers.appendChild(manager);
			$(this.children).each(function() {
			//$(this).siblings('ul').children('li').children('a').each(function(index) {
				xmlHelper.appendNewLineElement(manager, 5);
				employee = xmlHelper.createElement("employee", this.data.loginname);
				manager.appendChild(employee);
			})
			xmlHelper.appendNewLineElement(manager, 4);
		}) 
		xmlHelper.appendNewLineElement(managers, 3);
		xmlHelper.appendNewLineElement(section, 2);
	})
/*	
	$("#jstree>ul>li").children('a').each(function(index) {
		xmlHelper.appendNewLineElement(sections, 2);
		section = xmlHelper.createElementWithAttribute("section", 'id', $(this).parent().attr('id'));
		xmlHelper.appendAttributeToElement(section, 'name', $(this).text().trim());
		xmlHelper.appendAttributeToElement(section, 'arName', $(rootActors).find('section[id="' + $(this).parent().attr('id') + '"]').attr('arName'));
		sections.appendChild(section);
		xmlHelper.appendNewLineElement(section, 3);
		managers = document.createElementNS("", "managers");
		section.appendChild(managers);
		$(this).siblings('ul').children('li').children('a').each(function(index) {
			xmlHelper.appendNewLineElement(managers, 4);
			manager = xmlHelper.createElementWithAttribute("manager", 'name', $(this).children('span').text());
			managers.appendChild(manager);
			$(this).siblings('ul').children('li').children('a').each(function(index) {
				xmlHelper.appendNewLineElement(manager, 5);
				employee = xmlHelper.createElement("employee", $(this).children('span').text());
				manager.appendChild(employee);
			})
			xmlHelper.appendNewLineElement(manager, 4);
		}) 
		xmlHelper.appendNewLineElement(managers, 3);
		xmlHelper.appendNewLineElement(section, 2);
	});
*/	
	
	xmlHelper.appendNewLineElement(sections, 1);
	xmlHelper.appendNewLineElement(department, 1);
	var employees = $(rootActors).find("department>employees").clone();
	$(department).append(employees);
	xmlHelper.appendNewLineElement(department, 0);

	$.ajaxSetup({ cache: false, async: true });
	//$.post("xml-write.php", {'fileName': 'actors.xml', 'xml' : $.xml(department)})
	$.post("json_db_crud_pdo.php", {'func':'saveActors', 'param' : $.xml(department)})
		.done(function( data ) {
			if (isAjaxError(data))
				return;
		
			// if (data && data.constructor == Array) {
				// if (data[0] && data[0].error != undefined) {
					// alert (data[0].error);
					// return;
				// }
			// }
		})
		.always(function() {
			$.ajaxSetup({ cache: false, async: false });
		});
}


$(function() {
	$(document).on("click", "#addUserButton", function(){
		//$("#addUserError").detach();
		error("");
		//var obj = $("#userList>input");
		var obj = $("#newUserInput");
		if (obj.val().length == 0)
			return;

		var found = false;
		userInfo.some(function(o) {
			if (obj.val() == o.loginName) {
		//html = ('<option {0} disabled="disabled" value="' + i + '">' + nam + '</option>').format((i + 1 == $(date).length) ? 'selected="selected"' : '');
			
				//$(".leftSection").append('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">The user ' + obj.val() + ' already exists</div>');
				//$(".leftSection").append(('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">The user {0} already exists</div>').format(obj.val()));
				//$(".leftSection").append('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">' + (jQuery.i18n.prop("UserExists")).format(obj.val()) + '</div>');
				error((jQuery.i18n.prop("UserExists")).format(obj.val()));
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
				//$(".leftSection").append('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">The user ' + obj.val() + ' does not exist</div>');
				//$(".leftSection").append(('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">The user {0} does not exist</div>').format(obj.val()));
				//$(".leftSection").append('<div id="addUserError" style="position:absolute; top:0px; right:10px; color:red; font-size:1.3em;">' + ($.i18n.prop("UserDoesNotExist")).format(obj.val()) + '</div>');
				error((jQuery.i18n.prop("UserDoesNotExist")).format(obj.val()));
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
			
			$.post("json_db_crud_pdo.php", {'func':'saveActors', 'param' : $.xml(rootActors)})
				.done(function( data ) {
					if (isAjaxError(data))
						return;
				
					// if (data && data.constructor == Array) {
						// if (data[0] && data[0].error != undefined) {
							// alert (data[0].error);
							// return;
						// }
					// }
				});
			
			//$.post("xml-write.php", {'fileName': 'actors.xml', 'xml' : $.xml(rootActors)},
			//function(data, status){
			//	if (data.error) {
			//		alert("Data: " + data + "\nStatus: " + status);
			//	}
			//}, "text");
		});
	});
})

function fillUserList() {
	var a = [];
	userInfo.forEach(function(o, index) {
		if (index != 0)
			a.push(o.displayName + "|" + o.loginName);
	});
	
	a.sort(
		function(a, b) {
			if (a.toLowerCase() < b.toLowerCase()) return -1;
			if (a.toLowerCase() > b.toLowerCase()) return 1;
			return 0;
		}
	);

	if ($("#userList").hasClass("jstree")) {
		$("#userList").jstree('destroy').empty();
		//$("#userList>ul").remove();
		$("#userList").append('<ul></ul>');
	}
	
	//$("#userList>ul>li").remove();
	//$("#userList>div>div").remove();
	
	a.forEach(function(name){
		name = name.split('|');
		//$("#userList>div").append('<div class="ui-state-default jstree-draggable">' + name[0] + '<span class="userListHiddenElement">' + name[1] + '</span></div>');
		//$("#userList>ul").append('<li class="ui-state-default jstree-draggable">' + name[0] + '<span class="userListHiddenElement">' + name[1] + '</span></li>');
		//$("#userList>ul").append('<li class="ui-state-default jstree-draggable">' + name[0] + '<span class="userListHiddenElement">' + name[1] + '</span></li>');
		//$("#userList>ul").append('<li class="jstree-node ui-state-default jstree-draggable ui-draggable">' + name[0] + '<span class="userListHiddenElement">' + name[1] + '</span></li>');
		//$("#userList>ul").append('<li class="jstree-drop">' + name[0] + '<span class="userListHiddenElement">' + name[1] + '</span></li>');
		$("#userList>ul").append('<li data-loginname="' + name[1] + '">' + name[0] + '</li>');
	});
}
//jstree-node ui-state-default jstree-draggable ui-draggable 
function insertForm(that) {
	saveForm(that, "insertForm");
}

function updateForm(that) {
	saveForm(that, "updateForm");
}

function saveForm(that, func) {
/*
	//var bValid = true;

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

	
	//bValid = bValid && checkRegexp( name, /^[a-z]([0-9a-z_])+$/i, "User name may consist of a-z, 0-9, underscores, begin with a letter." );
	//// From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
	//bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "Wrong e-mail address." );
	//bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
	
	//var form = $(that.form);							// form context
	//var file_number_val = form.find("#file_number").val();
	//var area_val = form.find("#area").val();
	//var block_val = form.find("#block").val();
	//var street_val = form.find("#street").val();
	//var building_val = form.find("#building").val();
	//var paci_number_val = form.find("#paci_number").val();
	//var title_val = form.find("#title").val();
*/	

	var currForm = $('#' + _currentForm);

	var formFields, radioFields, checkboxFields; //, tableFields;
	var param = {};

	if ("main-form" == _currentForm) {
		formFields = currForm.find("input[type='text']").not("#error-box").filter(function() {
			return $(this).parent()[0].tagName != "TD";
		});
		//tableFields = currForm.find(".Switch, .K1000KWT, .K1000AMP, .K1250KWT, .K1250AMP, .K1600KWT, .K1600AMP");
	} else if ("load-form" == _currentForm) {
		formFields = currForm.find("input[type='text']").not("#error-box, #owner-name2, #project-name2, #area2, #block2, #plot2, #construction-exp-date2, #feed-points2").filter(function() {
			return $(this).parent()[0].tagName != "TD";
		});
		formFields = formFields.add($('#application-number')).add($('#power-factor-summer')).add($('#power-factor-winter')).add($('#maximum-loads-summer')).add($('#maximum-loads-winter'));
		//tableFields = currForm.find(".description, .connector-load, .summer-load, .winter-load, .remarks");
	}
	
	radioFields = currForm.find("input[type='radio']");
	checkboxFields = currForm.find("input[type='checkbox']");

	
		//formFields = currForm.find('.app-table');
		
	
		//currForm.find("input[type='text']").not("#application-number, #application-date, #owner-name, #project-name, #area, #block, #plot, #construction-exp-date").val("");
		//currForm.find(':radio').not("input[name='project-type']").prop('checked', false);
		//currForm.find(':checkbox').prop('checked', false);
	
	//var checkup_number = $('#checkup_number'), date_ins = $('#date_ins'), load_new = $('#elc_load_new'), load_old = $('#elc_load_old'), tip = $('#validationCheckupTip');
	//var allFields = $([]).add(checkup_number).add(date_ins).add(load_new).add(load_old).add(tip);
	//tip.html("&nbsp;");	
	//allFields.removeClass( "ui-state-error" );

	var valid = true, areaName;
	
	if ($('#error-box').length == 0)
		$('#left-section').append('<input type="text" id="error-box" tabindex="-1" />');
	
	myHelper.setValidationTip($('#error-box'));
	
	formFields.each(function() {
		if ($(this).attr('data-is-required'))
			valid = valid && myHelper.isRequired( $(this), $.i18n.prop(myHelper.hyphensToCamel(this.id)) );

		if (!valid)
			return false;

		$(this).removeClass( "ui-state-error" );

		if (this.id == 'area') {
			param['area-id'] = getAreaId(this.value);
			areaName =  this.value;
		}
		param[this.id] = this.value;
	});

	if (!valid)
		return;
	
	$('#error-box').val('');
	
	var indx = 0;
	radioFields.each(function() {
		//var that = $(this);
		if (param[this.name] == undefined) {
			indx = -1;
			param[this.name] = -1;
		}
		indx++;
		//} else {
		//	param[this.name] += this.checked ? 1 : 0;
/*		
			if (param[this.name] == 0)
				return true;	//continue
			if (param[this.name] % 10 != 0) {
				param[this.name] = Math.floor(param[this.name] / 10);
				return true;	//continue
			}
			
			param[this.name] += 10;
*/			
		//}
		
		if (this.checked)
			param[this.name] = indx;
			
		//param[this.name] += this.checked ? 1 : 0;
	});
	
	var bitmask = 8;
	checkboxFields.each(function() {
		if (param[this.name] == undefined) {
			bitmask = 8;
			param[this.name] = 0;
		}
		bitmask >>= 1;
		
		if (this.checked)
			param[this.name] |= bitmask;
		
	})
	
	
	param["table"] = []; param["table"].push({});
	
	var indx = 0;
	var foundValue = false;
	var tr_detail = {};
	
	if ("main-form" == _currentForm)
		tr_detail = $('.tr-application-detail');
	else if ("load-form" == _currentForm)
		tr_detail = $('.tr-load-detail');
	
	//var currentClass = tr_detail.attr('class');
	
	tr_detail.each(function(i, tr) {
		$(tr).find("input[type='text']").each(function(i2, el) {
			if (!foundValue && el.value != "")
				foundValue = true;

			if ($(el).hasClass("ui-state-error"))
				$(el).removeClass("ui-state-error");
			
			param["table"][indx][el.className] = el.value;
		})
		
		if (foundValue) {
			indx++;
			foundValue = false;
			param["table"].push({});
		} else {
			if ($('.' + $(tr).attr('class')).length > 1)
				$(tr).remove();
		}
	})
	
	param["table"].splice(-1, 1);
/*
	if ("main-form" == _currentForm)
		tr_detail = $('.tr-application-detail');
	else if ("load-form" == _currentForm)
		tr_detail = $('.tr-load-detail');
*/	
	tr_detail = $('.' + tr_detail.attr('class'));
	
	valid = true;
	$.each(param["table"], function(i, row) {
		$.each(row, function(key, val) {
			var el = $(tr_detail[i]).find('.' + key);
			if (el.attr('data-is-required'))
				valid = valid && myHelper.isRequired( el, $.i18n.prop(myHelper.hyphensToCamel(el.attr('class'))) );

			if (!valid)
				return false;

			//el.removeClass( "ui-state-error" );
		})

		if (!valid)
			return false;
	})
	
	if (!valid)
		return;
		
		
	var ConnectorLoad = 0, SummerLoad = 0, WinterLoad = 0;
	
	var v;
	tr_detail.each(function(i, tr) {
		v = $(tr).find('td:nth-child(2)>input').val()
		ConnectorLoad += parseFloat(v == "" ? 0 : v);
		v = $(tr).find('td:nth-child(3)>input').val()
		SummerLoad += parseFloat(v == "" ? 0 : v);
		v = $(tr).find('td:nth-child(4)>input').val()
		WinterLoad += parseFloat(v == "" ? 0 : v);
	})

	var r;
	//if (!(ConnectorLoad == 0 && SummerLoad == 0 && WinterLoad == 0)) {
		r = $('.tr-load-detail:last').next();
		r.find('td:eq(1)>input').val(format( "#,##0.##0", ConnectorLoad));
		r.find('td:eq(2)>input').val(format( "#,##0.##0", SummerLoad));
		r.find('td:eq(3)>input').val(format( "#,##0.##0", WinterLoad));
	//} else {
		
/*	
	//Switch, K1000KWT, K1000AMP, K1250KWT, K1250AMP, K1600KWT, K1600AMP - 7 columns
	tableFields.each(function(index) {
		if (index / 7 == Math.floor(index / 7)) {
		
			param["table"].push({});
		}
		
		param["table"][Math.floor(index / 7)][this.className] = this.value;
	});
*/
/*
	param["schema"] = [];
	param["schema"].push({});
	param["schema"][0]["parent-table"] = currForm.attr('data-parent-table');
	param["schema"].push({});
	param["schema"][1]["child-table"] = currForm.attr('data-child-table');
	param["schema"].push({});
	param["schema"][2]["primary-key"] = currForm.attr('data-key-field');
*/

	param["application-creator"] = userInfo[0].displayName;
	param["office-id"] = sectionId;	
	param["schema"] = _currentForm;
	
	if ( valid ) {
		url = "json_db_crud_pdo.php";
		data = {"func": func,
			"param": param
				// docFileNumber:file_number.val(),
				// docApprover:userInfo[0].displayName,
				// docDate:getDate(),
				// //docAreaId:areaId,
				// docAreaId:getAreaId(area.val()),
				// docAreaName:area.val(),
				// //docAreaName:areaName,
				// docBlock:block.val(),
				// docPlot:plot.val(),
				// //docBuilding: building.val(),
				// //docPACINumber:paci_number.val(),
				// docTitle:title.val(),
				// originFileNumber: (newDoc) ? null : $("#newForm").data('originFileNumber'),
				// udateIfExists: udateIfExists,
			};

		var errorFound = false;
		$.post(url, data)
		.done(function(data){
			//if (data.error) {
			//	alert("Data: " + data + "\nStatus: " + status);
			//}
			if (data && data.constructor == Array) {
				if (data[0] && data[0].error !== undefined) {
					errorFound = true;
					if (data[0].error == "1003")
						alert(($.i18n.prop("ApprovedCannotBeModified")).format($('#' + $('#' + _currentForm).attr('data-key-field')).val()));
					else if (data[0].error == "23000")
						alert(($.i18n.prop("AlreadyExists")).format($('#' + $('#' + _currentForm).attr('data-key-field')).val()));
					else
						alert(data[0].error);
					
					return;
				} else if (data != null) {
					areaId = data[0];
					areaNames.push({id:areaId, label:areaName});
					//gridReload('customReset');	// custom reset
					//gridReload('customReset', $('#application-number').val());	// custom reset
					//updateLoadForm();
				}
			}

			if ("main-form" == _currentForm) {
				if (func == "insertForm") {
					addRowToGrid(param);
				} else {
					//gridReload('customReset', $('#application-number').val());	// custom reset
					gridReload('reset');	// custom reset
				}
				updateLoadForm();
			} else if ("load-form" == _currentForm) {
				if ($('#file-number').attr('readonly') == undefined)
					$('#file-number').attr('readonly', 'readonly');
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			errorFound = true;
			alert("saveForm - error: " + errorThrown);
		})
		.always(function() {
		});
	}
}

function deleteForm() {
	var attr = $('#' + _currentForm).attr('data-key-field');
	var param = {};
	param[attr] = $('#' + attr).val();
	param["schema"] = _currentForm;
/*
	//param[$('#' + _currentForm).attr('data-key-field')] = $('#' + $('#' + _currentForm).attr('data-key-field')).val();
	param["schema"] = [];
	param["schema"].push({});
	param["schema"].push({});
	param["schema"].push({});
	param["schema"][2]["primary-key"] = attr;
	//param["schema"][2]["primary-key"] = $('#' + _currentForm).attr('data-key-field');
*/

	var url = "json_db_crud_pdo.php";
	var data = {"func":"delete", "param":param};

	$.post(url, data)
		.done(function(data){
			if (data && data.constructor == Array) {
				if (data[0] && data[0].error !== undefined) {
					if (data[0].error == "1003")
						alert(($.i18n.prop("ApprovedCannotBeDeleted")).format(fileNumber));
					else
						alert(data[0].error);
				}
			} else {
				if ("main-form" == _currentForm)
					$grid.jqGrid("delRowData", _rowId);
					
				clearForm();
				
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			alert("deleteDoc - error: " + errorThrown);
		});
}

function clearForm() {
	var currForm = $('#' + _currentForm);
	currForm.find("input[type='text']").val("");
	currForm.find(':radio').prop('checked', false);
	currForm.find(':checkbox').prop('checked', false);

	if ("main-form" == _currentForm) {
		$('#app-number-search').val("");
		_applicationNumber = "";
		$('#application-number').removeAttr('readonly');
		
		$("#grid").jqGrid('resetSelection');
		_rowId = _page = 0;
	} else if ("load-form" == _currentForm) {
		$('#file-number').removeAttr('readonly');
	}

	//$(".dragclone").remove();
	$('#' + _currentForm + ' .dragclone').remove();

/*
	$(".dragclone").each(function() {
		$(this).attr('id').search(/([0-9]*)$/);
		var id = RegExp.$1;
		if ("main-form" == _currentForm || $(this).attr('id').search(_currentForm) != -1) {
			$(this).remove();
		}	
	})
*/	
	updateLoadForm();

	if (currForm.is(':visible')){
		setTimeout(function() {
			$('#application-number').focus();
		}, 100 );
	}
}

function updateLoadForm() {										// id="load-form"
	$('#owner-name2').val($('#owner-name').val());
	$('#project-name2').val($('#project-name').val());
	$('#area2').val($('#area').val());
	$('#block2').val($('#block').val());
	$('#plot2').val($('#plot').val());
	$('#construction-exp-date2').val($('#construction-exp-date').val());
	$('#feed-points2').val($('#feed-points').val());
	
	var s = jQuery('#grid').jqGrid('getGridParam','selrow');
	if (s != null)
		disableAccordionTabs(false);
	else
		disableAccordionTabs(true);
}

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
				//console.log("alert dialog box closed");
				$(this).dialog( "close" );
			},
		},
	});
}

this.confirm = function(text, param, func) {
	var form = $("<div/>");
	html = '<div>' + $.i18n.prop(text) + '</div>';
    form.html(html);
    form.dialog({
		title:$.i18n.prop('Confirm'),
		dialogClass: "no-close",
        height: "auto", //640,
        width: 300,
        modal: true,
		autoOpen: true,
		resizable: false,
		open: function( event, ui ) {
			$(this).dialog( "option", "buttons",
				[{	text: "Ok",
					//id: "buttSave",
					click: function() {
						if (func != null)
							func(param);

						$( this ).dialog( "destroy" )
					}
				},
				{	text: "Cancel",
					click: function() {
						$( this ).dialog( "destroy" )
					}
				}]
			); 
			
			//ui-dialog-buttonset
			$(this).parent().find(".ui-button-text").each(function() {
				var that = $(this);
				if (that.text() == "Ok")
					that.text(jQuery.i18n.prop('Ok'));
				else if (that.text() == "Cancel")
					that.text(jQuery.i18n.prop('Cancel'));
			});
		},
		close: function( event, ui ) {
		},
    });
}

function toggleLanguage(lang, dir) {
	var left = $(".floatLeft");
	var right = $(".floatRight");
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

			if (dir == 'ltr') {
				$.datepicker.setDefaults( $.datepicker.regional[ lang == "en" ? "" : lang ] );
				$(".rid50-datepicker").datepicker("option", "changeMonth", lang == "en" ? true : false);
			} else {
				$(".rid50-datepicker").datepicker("option", "changeMonth", lang == "en" ? true : false);
				$.datepicker.setDefaults( $.datepicker.regional[ lang == "en" ? "" : lang ] );
			}

			userAssignment();
			
			toggleGrid(lang);

			$('#copyright').text(jQuery.i18n.prop('Copyright'));

			if (dir == 'ltr') {
				//$.datepicker.setDefaults( $.datepicker.regional[ lang == "en" ? "" : lang ] );
				//$(".rid50-datepicker").datepicker("option", "changeMonth", lang == "en" ? true : false);
			
				//$("#left-section").css("margin", "0 6px 0 0");
				$("#left-section").css("margin-left", "0");
				$("#left-section").css("margin-right", "6px");
				$("#right-section").css("text-align", "right");
				//$("#accordion>span").css("text-align", "right");
				$("#left-section, #right-section").css("box-shadow", "4px 4px 2px #999");
				//$(".ui-accordion .ui-accordion-content").css({'padding': '1em 8px 1em 0px'});
				
				$('form input.text')
				.not('#residence-total-area, #construction-area, #ac-area, #current-load, #extra-load, #load-after-delivery, #conductive-total-load')
				.css({'margin-right':'20px', 'margin-left':'0px'});

				$('label[for="square-meters"]').css({'margin-right':'20px', 'margin-left':'0px'});
				$('label[for="kilo-watt"]').css({'margin-right':'20px', 'margin-left':'0px'});
				
				$('form input[type="radio"]').css({'margin':'0 0 10px 20px'});
				$("#main-form>div>div:first").css('left','auto').css('right','0');
				$("#load-form>div>div:first").css('left','auto').css('right','0');

				$("#possibility-yes, #possibility-no").css("text-align", "left");
				
				$('#formButtonSet').css({'left':'auto', 'right':'10px'});
				
			} else {
				//$("#left-section").css("margin", "0, 0, 0, 6px");
				$("#left-section").css("margin-left", "6px");
				$("#left-section").css("margin-right", "0");
				$("#right-section").css("text-align", "left");
				//$("#accordion>span").css("text-align", "right");				
				$("#left-section, #right-section").css("box-shadow", "-4px 4px 2px #999");
				//$(".ui-accordion .ui-accordion-content").css({'padding': '1em 0px 1em 8px'});

				//$('form input.text').css({'margin':'0 0 10px 20px'});
				
				$('form input.text')
				.not('#residence-total-area, #construction-area, #ac-area, #current-load, #extra-load, #load-after-delivery, #conductive-total-load')
				.css({'margin-right':'0px', 'margin-left':'20px'});

				$('label[for="square-meters"]').css({'margin-right':'0px', 'margin-left':'20px'});
				$('label[for="kilo-watt"]').css({'margin-right':'0px', 'margin-left':'20px'});
				
				$('form input[type="radio"]').css({'margin':'0 20px 10px 0'});
				$("#main-form>div>div:first").css('left','0').css('right','auto');
				$("#load-form>div>div:first").css('left','0').css('right','auto');

				//$(".rid50-datepicker").datepicker("option", "changeMonth", lang == "en" ? true : false);
				//$.datepicker.setDefaults( $.datepicker.regional[ lang == "en" ? "" : lang ] );
				
				$("#possibility-yes, #possibility-no").css("text-align", "right");
				
				$('#formButtonSet').css({'left':'10px', 'right':'auto'});
				
			}

			$('#add, #newForm').attr({title: $.i18n.prop('AddForm')});
			$('#editForm').attr({title: $.i18n.prop('EditForm')});
			$('#save').attr({title: $.i18n.prop('SaveForm')});
			$('#print, #printForm').attr({title: $.i18n.prop('PrintForm')});
			$('#delete').attr({title: $.i18n.prop('DeleteForm')});
			$('.addRow').attr({title: $.i18n.prop('AddRow')});
			$('.deleteRow').attr({title: $.i18n.prop('DeleteRow')});
			$('#sync').attr({title: $.i18n.prop('GoToLastSelectedRow')});
			
			$("#addUserButton").button({ label: $.i18n.prop('AddUser')});

			$('#application-form-link').html($.i18n.prop('ApplicationForm'));
			$('#load-form-link').html($.i18n.prop('LoadsRequired'));
					
			$($("#divGrid>form>div:first:nth-child(1)>span")[0]).text(($.i18n.prop('SearchByFileNumber')));
			$($("#divGrid>form>div:first:nth-child(1)>span")[1]).text(($.i18n.prop('EnableAutosearch')));
			$('#gridSubmitButton').button({ label: $.i18n.prop('Go')});
						
			var obj = $("#accordion>span:nth-child(1)").contents().filter(function() {return this.nodeType == 3;});
			obj.get()[0].textContent = jQuery.i18n.prop('Application');
			$("#accordion>div>div:first>span").text(jQuery.i18n.prop('App'));
			//$("#getPicture").button({ label: $.i18n.prop('getPicture')});

			obj = $("#accordion>span:nth-child(3)").contents().filter(function() {return this.nodeType == 3;});
			obj.get()[0].textContent = jQuery.i18n.prop('Form');

			obj = $("#accordion>span:nth-child(5)").contents().filter(function() {return this.nodeType == 3;});
			obj.get()[0].textContent = jQuery.i18n.prop('ReportPreview');
			$("#signButton").button({ label: $.i18n.prop('Sign')});
			$("#signButton").attr({title: jQuery.i18n.prop('SignDocument')});

			obj = $("#accordion>span:nth-child(7)").contents().filter(function() {return this.nodeType == 3;});
			obj.get()[0].textContent = jQuery.i18n.prop('Drawings');

			obj = $("#accordion>span:nth-child(9)").contents().filter(function() {return this.nodeType == 3;});
			obj.get()[0].textContent = jQuery.i18n.prop('UserAssignment');

			$('label[for="application-number"]').html($.i18n.prop('ApplicationNumber'));
			$('label[for="application-date"]').html($.i18n.prop('ApplicationDate'));
			$('label[for="owner-name"]').html($.i18n.prop('OwnerName'));
			$('label[for="project-name"], label[for="project-name2"]').html($.i18n.prop('ProjectName'));
			$('label[for="area"], label[for="area2"]').html($.i18n.prop('Area'));
			$('label[for="block"], label[for="block2"]').html($.i18n.prop('Block'));
			$('label[for="plot"], label[for="plot2"]').html($.i18n.prop('Plot'));
			$('label[for="construction-exp-date"]').html($.i18n.prop('ConstructionExpDate'));

			$('label[for="project-type"]').html($.i18n.prop('ProjectType'));
			$('label[for="private-housing"]').html($.i18n.prop('PrivateHousing'));
			$('label[for="investment"]').text($.i18n.prop('Investment'));
			$('label[for="commercial"]').text($.i18n.prop('Commercial'));
			$('label[for="governmental"]').text($.i18n.prop('Governmental'));
			$('label[for="agricultural"]').text($.i18n.prop('Agricultural'));
			$('label[for="industrial"]').text($.i18n.prop('Industrial'));

			$('label[for="residence-total-area"]').text($.i18n.prop('ResidenceTotalArea'));
			$('label[for="construction-area"]').text($.i18n.prop('ConstructionArea'));
			$('label[for="ac-area"]').text($.i18n.prop('ACArea'));
			$('label[for="square-meters"]').text($.i18n.prop('SquareMeters'));			
			
			$('label[for="current-load"]').text($.i18n.prop('CurrentLoad'));
			$('label[for="extra-load"]').text($.i18n.prop('ExtraLoad'));
			$('label[for="kilo-watt"]').text($.i18n.prop('KiloWatt'));			

			$('label[for="load-after-delivery"]').text($.i18n.prop('MaximumLoadAfterDelivery'));
			$('label[for="conductive-total-load"]').text($.i18n.prop('ConductiveTotalLoad'));

			$('label[for="feed-points"]').text($.i18n.prop('FeedPoints'));
			$('label[for="site-feed-point"]').text($.i18n.prop('SiteFeedPoint'));
			$('label[for="vault"]').text($.i18n.prop('Vault'));
			$('label[for="ground"]').text($.i18n.prop('Ground'));
			$('label[for="mezzanine"]').text($.i18n.prop('Mezzanine'));
			$('label[for="other"]').text($.i18n.prop('Other'));

			$('label[for="requirements"]').text($.i18n.prop('Requirements'));
			$('label[for="build"]').text($.i18n.prop('Build'));
			$('label[for="build2"]').text($.i18n.prop('Build2'));
			$('label[for="build3"]').text($.i18n.prop('Build3'));

			$('#cable-size legend').html($.i18n.prop('CableSize'));
			$('#fuze legend').html($.i18n.prop('Fuze'));
			$('#meter legend').html($.i18n.prop('Meter'));
			
			$('#possibility-yes legend').html($.i18n.prop('PossibilityYes'));
			$('label[for="station-no"]').text($.i18n.prop('StationNo'));
			$('label[for="special-adapter"]').text($.i18n.prop('SpecialAdapter'));
			$('label[for="private-station"]').text($.i18n.prop('PrivateStation'));
			
			$('#possibility-no legend').html($.i18n.prop('PossibilityNo'));
			$('label[for="no-electric-grid-access"]').text($.i18n.prop('NoElectricGridAccess'));
			$('label[for="wanted-another-site"]').text($.i18n.prop('WantedAnotherSite'));
			$('label[for="required-secondary-site"]').text($.i18n.prop('RequiredSecondarySite'));
			
			$('label[for="switchCapacity"]').text($.i18n.prop('SwitchCapacity'));
			$('label[for="kqa"]').text($.i18n.prop('Kqa'));
			$('label[for="number"]').text($.i18n.prop('Number'));
			$('label[for="loadAfterDelivery"]').text($.i18n.prop('LoadAfterDelivery'));
			$('label[for="summer"]').text($.i18n.prop('Summer'));
			$('label[for="winter"]').text($.i18n.prop('Winter'));
			$('label[for="meterSize"]').text($.i18n.prop('MeterSize'));
			$('label[for="amp"]').text($.i18n.prop('Amp'));
			
			$('label[for="load-date"]').text($.i18n.prop('LoadDate'));
			$('label[for="file-number"]').text($.i18n.prop('FileNumber'));
			
			$('label[for="construction-exp-date2"]').text($.i18n.prop('ConstructionExpDate2'));
			$('label[for="owner-name2"]').text($.i18n.prop('ConsumerName'));
			$('label[for="feed-points2"]').text($.i18n.prop('FeedPoints2'));
			
			$('label[for="loads-required"]').text($.i18n.prop('LoadsRequired'));
			
			$('label[for="description"]').text($.i18n.prop('Description'));
			$('label[for="connector-load"]').text($.i18n.prop('ConnectorLoad'));
			$('label[for="kw"]').text($.i18n.prop('KW'));

			$('label[for="maximum-loads"]').text($.i18n.prop('MaximumDiverseLoads'));
			$('label[for="remarks"]').text($.i18n.prop('Remarks'));
			$('label[for="total-load"]').text($.i18n.prop('TotalLoad'));
			$('label[for="total-load"]').text($.i18n.prop('TotalLoad'));
			$('label[for="power-factor"]').text($.i18n.prop('PowerFactor'));
			
		}				
	});
}
	
this.confirm = function(text, param, func) {
	var form = $("<div/>");
	html = '<div>' + $.i18n.prop(text) + '</div>';
    form.html(html);
    form.dialog({
		title:$.i18n.prop('Confirm'),
		dialogClass: "no-close",
        height: "auto", //640,
        width: 300,
        modal: true,
		autoOpen: true,
		resizable: false,
		open: function( event, ui ) {
			$(this).dialog( "option", "buttons",
				[{	text: "Ok",
					//id: "buttSave",
					click: function() {
						if (func != null)
							func(param);

						$( this ).dialog( "destroy" )
					}
				},
				{	text: "Cancel",
					click: function() {
						$( this ).dialog( "destroy" )
					}
				}]
			); 
			
			//ui-dialog-buttonset
			$(this).parent().find(".ui-button-text").each(function() {
				var that = $(this);
				if (that.text() == "Ok")
					that.text(jQuery.i18n.prop('Ok'));
				else if (that.text() == "Cancel")
					that.text(jQuery.i18n.prop('Cancel'));
			});
		},
		close: function( event, ui ) {
		},
    });
}
