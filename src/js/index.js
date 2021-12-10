// tabsToggle(".class", ".class", "class")
function tabsToggle(btnSelector, contentWrapperSelector, activeBtnSelector) {
	let tabBtn = $(btnSelector);
	let tabContent = $(contentWrapperSelector);

	tabBtn.click(function (e) {
		e.preventDefault();
		let that = $(this);
		let btnTarget = that.data("target");

		that.parent().find(tabBtn).removeClass(activeBtnSelector);
		that.addClass(activeBtnSelector);

		$(btnTarget).parent().find(tabContent).hide();
		$(btnTarget).show();
	});
}
