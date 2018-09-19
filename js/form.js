var LOCAL_STORAGE_NAME = 'triggerShoot';
Ext.define('trigger.model.RequestForm', {
	extend: 'Ext.data.Model',
	fields: [
		'scriptName',
		'creationDate',
		'dataForm'
	],
		proxy: {
		type: 'localstorage',
		id: LOCAL_STORAGE_NAME
	}
});

Ext.define('trigger.store.RequestForm', {
	extend: 'Ext.data.Store',
	model: 'trigger.model.RequestForm',
	autoLoad: true,
});

Ext.require('trigger.model.RequestForm');
Ext.require('trigger.store.RequestForm');
	
Ext.onReady(function(){
	Ext.require('Ext.resizer.Splitter');
	var DEFAULT_PARAMS = ['invoking_user', 'company_code', 'script'];
	var COMMON_PARAMS = [['sStatus'], ['param'], ['data']];
	
	
	function createNewField(fieldName, fieldValue) {
		return Ext.create('Ext.container.Container', {
			layout: 'hbox',
			items: [{
				xtype: 'textfield',
				name: fieldName,
				fieldLabel: fieldName,
				value: fieldValue,
				margin: '10 0 0 5',
				flex: 1
			}, {
				xtype: 'button',
				margins: '10 5 0 2',
				icon: 'pictures/del.png',
				text: 'Delete',
				length: '40',
				handler: function(button, e) {
					button.up('form').remove(button.up('container'));
				}
			}]
		});
	}
	
	function addFieldParam(fieldName, fieldValue) {
		if (fieldName == "") {
			Ext.MessageBox.alert('Error','Add parameter name');
		} else {
			var isNotExistParamYet = true;
			
			requestPanel.getForm().getFields().each(function(item){
				if (item.getName() == fieldName) {
					Ext.MessageBox.alert('Error', 'This parameter presents at Reques Panel yet!');
					isNotExistParamYet = false;
					return;
				}
			});
			
			if(isNotExistParamYet) {
				var index = requestPanel.items.length;
				requestPanel.insert(index-1, createNewField(fieldName, fieldValue));
			}
		}
	};
	
	var createRequestForm = function(data) {
		var index = requestPanel.items.length;
		for (var i = 1; i < index -1; i++) {
			requestPanel.remove(1);
		};
		
		for (var key in data) {
			var fieldValue = data[key];
			addFieldParam(key, fieldValue);
		};
	};
	
	var addFormParamsToLocalStorage = function() {
		var requesrParams = requestPanel.getValues();
		var scriptValue = requesrParams.script;
		if (scriptValue) {
			var newData = Ext.create('trigger.model.RequestForm', {
				scriptName: scriptValue,
				creationDate: new Date(),
				dataForm: requesrParams
			});
			
			var idItemForDelete;
			localStore.each(function(item){
				if (item.get('scriptName') === scriptValue) {
					idItemForDelete = item.getId();
				}
			});
			
			if (idItemForDelete) {
				localStore.remove(localStore.getById(idItemForDelete));
				localStore.sync();
			};
			
			if (localStore.getCount() >= 100) {
				Ext.MessageBox.alert('Error', 'The local store is full! Please, remove any element.');
			} else {
				newData.save();
				localStore.reload();
			}
		} else {
			Ext.MessageBox.alert('Error', 'Please, add script!');
		}
	}
	
	var localStore = Ext.create('trigger.store.RequestForm');
	
	var builderPanel = Ext.create('Ext.panel.Panel', {
		layout: {
			type: 'vbox',
			align: 'stretch'
		},
		title: 'New parameter',
		flex: 2,
		defaults: {
			margins: '5 10 5 10',
		},
		items: [{
			xtype: 'container',
			layout: 'hbox',
			items: [{
				xtype: 'combobox',	
				store: new Ext.data.SimpleStore({
					fields: ['param'],
					data: COMMON_PARAMS
				}),
				valueField: 'param',
				displayField:'param',
				queryMode: 'local',
				defaultValue: COMMON_PARAMS[0],
				listeners: {
					afterrender: function() {
						this.setValue(this.defaultValue);    
					}
				},
				flex: 3,
			},{
				xtype: 'button',
				text: 'Add',
				margin: '0 0 0 2',
				flex: 1,
				handler: function() {
					var newParam = builderPanel.items.get(0).items.get(0).getValue();
					addFieldParam(newParam);
				}
			}]
		},{
			xtype: 'container',
			layout: 'hbox',
			items: [{
				xtype: 'textfield',
				vtype:'alphanum',
				emptyText: 'add new parameter',
				flex: 3,
				listeners: {
					specialkey: function(field, evt) {
						if (evt.getKey() == evt.ENTER) {
							var newParam = builderPanel.items.get(1).items.get(0).getValue();
							addFieldParam(newParam);
						}
					}
				}
			},{
				xtype: 'button',
				text: 'Add',
				margin: '0 0 0 2',
				flex: 1,
				handler: function() {
					var newParam = builderPanel.items.get(1).items.get(0).getValue();
					addFieldParam(newParam);
				}
			}]
		},{
			xtype: 'container',
			layout: 'fit',
			border: 0,
			flex: 1,
			items: [{
				xtype: 'grid',
				id: 'gridStore',
				title: 'Data store',
				columns: [{
					header: 'script',
					dataIndex: 'scriptName',
					flex: 1
				},{
					header: 'Date',
					dataIndex: 'creationDate',
					xtype:'datecolumn',
					format: 'd.m.Y',
					align: 'center',
					width: 70,
				},{
					header: 'Del',
					xtype: 'actioncolumn',
					align: 'center',
					width: 40,
					items:[{
						icon:'pictures/del.png',
						handler:function (grid, rowIndex, colIndex) {
							localStore.removeAt(rowIndex);
							localStore.sync();
						}
					}]
				},{
					header: 'Add',
					xtype: 'actioncolumn',
					align: 'center',
					width: 40,
					items:[{
						icon:'pictures/add.png',
						handler: function(grid, rowIndex, colIndex) {
							var selectionModel= grid.getSelectionModel(), record;
	                		selectionModel.select(rowIndex);
	                		var formData = selectionModel.getSelection()[0].data.dataForm;
							createRequestForm(formData);
						}
					}]
				}],
				store: localStore
			}]
		}]
	});	
	
	var requestPanel = Ext.create('Ext.form.Panel', {
		autoScroll: true,
		id: 'requestPanel',
		layout: {
			type: 'vbox',
			align: 'stretch'
		},
		flex: 1,
		items: [{
			xtype: 'container',
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			items: [{
				xtype: 'button',
				text: 'Send',
				handler: function() {
<<<<<<< .mine
				Ext.Ajax.request({
					url: 'json/answer.json',
					//method: 'GET',
					params: requestPanel.getValues(),
					success: function (response, action) {
						Ext.getCmp('answerArea').setValue(Ext.decode(response.responseText).answer);
					},
					failure: function (response, action) {
						alert(response.responseText);
					}
				});
            }
			}]













=======
					Ext.Ajax.request({
						url: Ext.getCmp('server').getValue().link,
						method: 'GET',
						cors: true,
						useDefaultXhrHeader : false,
						params: requestPanel.getValues(),
						success: function (response, action) {
							Ext.getCmp('answerArea').setValue(Ext.decode(response.responseText).answer);
						},
						failure: function (form, action) {
							Ext.MessageBox.alert('Error', response.responseStatus);
						}
					});
				}
			},{
				xtype: 'button',
				text: 'Create json',
				handler: function() {
					Ext.getCmp('loadTextArea').setValue(Ext.encode(requestPanel.getValues()));
					loadPanel.expand();
				}
			},{
				xtype: 'button',
				text: 'Save to store',
				handler: addFormParamsToLocalStorage
		 	}]
>>>>>>> .theirs
		}]
	});
	
	var loadPanel = Ext.create('Ext.form.Panel', {
		layout: {
			type: 'vbox',
			align: 'stretch'
		},
		title: 'Load panel',
		height: 300,
		collapsed: true,
		collapsible: true,
		items: [{
			xtype: 'textarea',
			id: 'loadTextArea',
			margin: '10 10 5 10',
			flex: 1,
			autoScroll: true
		},{
			xtype: 'container',
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			items: [{
				xtype: 'button',
				text: 'Create form',
				width: 70,
				handler: function() {
					var data = Ext.decode(Ext.getCmp('loadTextArea').getValue());
					createRequestForm(data);
					loadPanel.collapse();
				}
			}],
			margins: '0 0 5 0'
		}]
	});
	
	var answerPanel =  Ext.create('Ext.panel.Panel', {
		layout: 'fit',
		title: 'Response answer panel',
		height: 200,
		items: [{
			xtype: 'textarea',
			id: 'answerArea',
			readeOnly: true,
			padding: 10,
			autoScroll: true
		}]
	});
	
	var splitPanel = {
		xtype: 'splitter',
		width: 2
	};
		
	var rightPanel = Ext.create('Ext.panel.Panel', {
		title: 'Request parameters panel',
		layout: {
			type: 'vbox',
			align: 'stretch'
		},
		flex: 3,
		items: [
			requestPanel,
			splitPanel,
			loadPanel,
			splitPanel,
			answerPanel
		]
	});
	
	for (var i=0; i < DEFAULT_PARAMS.length; i++) {
		addFieldParam(DEFAULT_PARAMS[i]);
	}		
	
    var viewport = Ext.create('Ext.container.Viewport', {
        layout: {
			type: 'hbox',	
			align: 'stretch'
        },
        items: [
			builderPanel,
			splitPanel,
			rightPanel
		]
    });
});