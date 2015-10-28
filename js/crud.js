Parse.initialize("fenNu0bkpKIh4AdH35nwQh8Ooc0xbOUYGNit8nTa", "kh0Zpnieb5JXQm383d0MgWaLJIsOukSHNp8sg3mX");

var Review = Parse.Object.extend("Review");

$(function() {
	$("#star").raty({
		
	});

	$("#average_star").raty({

	});

	$("#r1").raty({
		score: 1
	});
	$("#r2").raty({
		score: 5
	});
});


$("form").submit(function() {
	var review = new Review();

	var score = $("#star").raty({
		score: function() {
			return $(this).attr("data-score");
		}
	});

	$(this).find("div").each(function() {
		var part = $(this).children();
		alert(part.attr("id"));
		submitted.set(part.attr("id"), part.val());
		part.val("");
	});

	review.save(null, {
		success:getData
	});

	return false;
});

var getData = function() {
	var query = new Parse.Query(Review);

	// query requirement to have all 3 items

	query.find({
		success:buildReviews
	});
}

var buildReviews = function(data) {
	// $("#reviews");
}



