/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/rta/command/BaseCommand',
	'sap/ui/fl/changeHandler/BaseTreeModifier',
	'sap/ui/fl/Utils'
], function(BaseCommand, BaseTreeModifier, flUtils) {
	"use strict";

	/**
	 * Rename control variants
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.50
	 * @alias sap.ui.rta.command.ControlVariantSetTitle
	 */
	var ControlVariantSetTitle = BaseCommand.extend("sap.ui.rta.command.ControlVariantSetTitle", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				renamedElement : {
					type : "object"
				},
				oldText : {
					type : "string"
				},
				newText : {
					type : "string"
				},
				titleChange : {
					type : "any"
				}
			},
			associations : {},
			events : {}
		}
	});

	ControlVariantSetTitle.prototype.MODEL_NAME = "$FlexVariants";

	/**
	 * @override
	 */
	ControlVariantSetTitle.prototype.prepare = function(mFlexSettings, sVariantManagementReference) {
		this.sLayer = mFlexSettings.layer;
	};

	/**
	 * @public Template Method to implement execute logic, with ensure precondition Element is available
	 * @returns {promise} Returns resolve after execution
	 */
	ControlVariantSetTitle.prototype.execute = function() {
		var oVariantManagementControl = this.getRenamedElement(),
			oVariantManagementControlBinding = oVariantManagementControl.getTitle().getBinding("text");

		this.oAppComponent = flUtils.getAppComponentForControl(oVariantManagementControl);
		this.oModel = this.oAppComponent.getModel(this.MODEL_NAME);
		this.sVariantManagementReference = BaseTreeModifier.getSelector(oVariantManagementControl, this.oAppComponent).id;
		this.sCurrentVariant = this.oModel.getCurrentVariantReference(this.sVariantManagementReference);

		var sCurrentTitle = this.oModel.getVariantProperty(this.sCurrentVariant, "title");
		this.setOldText(sCurrentTitle);

		var mPropertyBag = {
			appComponent : this.oAppComponent,
			variantReference : this.sCurrentVariant,
			title : this.getNewText(),
			layer : this.sLayer
		};

		return Promise.resolve(this.oModel._setVariantProperties(this.sVariantManagementReference, mPropertyBag, true))
						.then(function(oChange) {
								this.setTitleChange(oChange);
								oVariantManagementControlBinding.checkUpdate(true); /*Force Update as binding key stays same*/
						}.bind(this));
	};

	/**
	 * @public Template Method to implement undo logic
	 * @returns {promise} Returns resolve after undo
	 */
	ControlVariantSetTitle.prototype.undo = function() {
		var oVariantManagementControlBinding = this.getRenamedElement().getTitle().getBinding("text"),
			mPropertyBag = {
			variantReference : this.sCurrentVariant,
			title : this.getOldText(),
			change: this.getTitleChange()
		};

		return Promise.resolve(this.oModel._setVariantProperties(this.sVariantManagementReference, mPropertyBag, false))
						.then( function(oChange){
								this.setTitleChange(oChange);
								oVariantManagementControlBinding.checkUpdate(true); /*Force Update as binding key stays same*/
						}.bind(this));
	};

	return ControlVariantSetTitle;

}, /* bExport= */true);
