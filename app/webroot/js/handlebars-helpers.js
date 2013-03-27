/* ******************************************************************** */
/* Spreedia Handlebars Helpers */
/* ******************************************************************** */

/**
 * Spreedia Image helpers
 */
Handlebars.registerHelper('img120', function(context) {
	return "<img class='thumb' src='/images/storeimages/120/" + context.replace('.jpg','_120.jpg') + "'>";
});
Handlebars.registerHelper('img360', function(context) {
	return "<img class='thumb' src='/images/storeimages/360/" + context.replace('.jpg','_360.jpg') + "'>";
});
Handlebars.registerHelper('img900', function(context) {
	return "<img class='thumb' src='/images/storeimages/900/" + context.replace('.jpg','_900.jpg') + "'>";
});
Handlebars.registerHelper('img', function(context) {
	return "<img class='thumb' src='/images/storeimages/full/" + context + "'>";
});

/**
 * Spreedia Icon helper
 */
Handlebars.registerHelper('icon', function(context) {
	// alert(Handlebars.icons[0]);
	return "<span class='green icon match' data-icon='" + context.id + "' title='" + context.name.replace(/'/g, "&#39;") + "'>" + context.char + "</span>";

});

/* ******************************************************************** */
/* Comparison Handlebars Helpers by Dan Harper (http://github.com/danharper) */
/* ******************************************************************** */

/**
 * If Equals
 * if_eq this compare=that
 */
Handlebars.registerHelper('if_eq', function(context, options) {
	if (context == options.hash.compare)
		return options.fn(this);
	return options.inverse(this);
});

/**
 * Unless Equals
 * unless_eq this compare=that
 */
Handlebars.registerHelper('unless_eq', function(context, options) {
	if (context == options.hash.compare)
		return options.inverse(this);
	return options.fn(this);
});

/**
 * If Greater Than
 * if_gt this compare=that
 */
Handlebars.registerHelper('if_gt', function(context, options) {
	if (context > options.hash.compare)
		return options.fn(this);
	return options.inverse(this);
});

/**
 * Unless Greater Than
 * unless_gt this compare=that
 */
Handlebars.registerHelper('unless_gt', function(context, options) {
	if (context > options.hash.compare)
		return options.inverse(this);
	return options.fn(this);
});

/**
 * If Less Than
 * if_lt this compare=that
 */
Handlebars.registerHelper('if_lt', function(context, options) {
	if (context < options.hash.compare)
		return options.fn(this);
	return options.inverse(this);
});

/**
 * Unless Less Than
 * unless_lt this compare=that
 */
Handlebars.registerHelper('unless_lt', function(context, options) {
	if (context < options.hash.compare)
		return options.inverse(this);
	return options.fn(this);
});


/**
 * If Greater Than or Equal To
 * if_gteq this compare=that
 */
Handlebars.registerHelper('if_gteq', function(context, options) {
	if (context >= options.hash.compare)
		return options.fn(this);
	return options.inverse(this);
});

/**
 * Unless Greater Than or Equal To
 * unless_gteq this compare=that
 */
Handlebars.registerHelper('unless_gteq', function(context, options) {
	if (context >= options.hash.compare)
		return options.inverse(this);
	return options.fn(this);
});


/**
 * If Less Than or Equal To
 * if_lteq this compare=that
 */
Handlebars.registerHelper('if_lteq', function(context, options) {
	if (context <= options.hash.compare)
		return options.fn(this);
	return options.inverse(this);
});

/**
 * Unless Less Than or Equal To
 * unless_lteq this compare=that
 */
Handlebars.registerHelper('unless_lteq', function(context, options) {
	if (context <= options.hash.compare)
		return options.inverse(this);
	return options.fn(this);
});

/**
 * Convert new line (\n\r) to <br>
 * from http://phpjs.org/functions/nl2br:480
 */
Handlebars.registerHelper('nl2br', function(text) {
	var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
	return new Handlebars.SafeString(nl2br);
});