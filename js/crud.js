Parse.initialize("fenNu0bkpKIh4AdH35nwQh8Ooc0xbOUYGNit8nTa", "kh0Zpnieb5JXQm383d0MgWaLJIsOukSHNp8sg3mX");

var Review = Parse.Object.extend("Review");
var totalRating = 0;			// total rating added together
var numRating = 0;			// number of ratings product has

$(function() {

	$("#sign-in").submit(function() {
		signin();
// empty out user and pas
		return false;
	});

	$("#sign-up").click(function () {
		signup();

		return false;
	});

	$("header").on("click", "#sign-out", function() {
		signout();

		return false;
	})

	$("#star").raty({
		score: 0
	});

	$("#reviews").on("click", ".i-thumb", function() {
		helpful($(this));
	})

	$("#reviews").on("mouseover", ".i-thumb", function() {
		if ($(this).attr("class").indexOf("up") < 0) {
			$(this).attr("class", "fa fa-thumbs-down i-thumb");
		} else {
			$(this).attr("class", "fa fa-thumbs-up i-thumb");
		}
	});

	$("#reviews").on("mouseleave", ".i-thumb", function() {
		if ($(this)	.attr("class").indexOf("up") < 0) {
			$(this).attr("class", "fa fa-thumbs-o-down i-thumb");
		} else {
			$(this).attr("class", "fa fa-thumbs-o-up i-thumb");
		}
	});

	$("#reviews").on("click", ".i-trash", function() {
		purge($(this));
	})


	$("#reviews").on("mouseover", ".i-trash", function() {
		$(this).attr("class", "fa fa-trash i-trash");
		
	});

	$("#reviews").on("mouseleave", ".i-trash", function() {
		$(this).attr("class", "fa fa-trash-o i-trash");
	});

	$('submission').submit(function() {
		saving();
		return false;
	});

	getData();
});


// $('form').submit(function() {
var saving = function() {
	var review = new Review();

	var score = parseInt($("#star").raty("score"), 10);
	// remind me to sanitize the score
	review.set("rating", score);

	// rating, title, review
	$("#submission").find("div").each(function() {
		var part = $(this).children();
		review.set(part.attr("id"), part.val());
		part.val("");
	});

	review.set("upvotes", 0);
	review.set("allVotes", 0);

	$("#star").raty({ score: 0 });
	review.save(null, {
	 	success:getData
	});
};

var getData = function() {
	var query = new Parse.Query(Review);

	// query requirement to have all 3 items
	query.exists("rating");
	query.exists("title");
	query.exists("review");
	query.addDescending("createdAt");

	query.find({
		success:buildReviews
	});
}

var buildReviews = function(data) {
	$("#reviews").empty();
	$("#reviews").append($("<h2>").text("Reviews"));
	
	$.each(data, function(i, element) {
		addItem(element);
	});

	$("#averageRating").raty({
		score: totalRating / numRating,
		readOnly: true
	});
}

var addItem = function(item) {
	var review = $("<div>").addClass("row");
	review.attr("id", item.id);
	var reviewContent = $("<div>").addClass("col-xs-12 pastReviews");
	
	totalRating += item.get("rating");
	numRating++;

	reviewContent.append($("<div class='reviewedRate'>").raty({ 
		score: item.get("rating"),
		width: 150,
		readOnly: true
	}));
	reviewContent.append($("<h4 id='rh4'>").text(item.get("title")));
	var thumbs = $("<div>").addClass("thumb");
	thumbs.html("<i class='fa fa-thumbs-o-up i-thumb' title='You find this helpful'></i><i class='fa fa-thumbs-o-down i-thumb' title='You find this not helpful'></i>");
	reviewContent.append(thumbs);

	var date = item.get("createdAt");
	reviewContent.append($("<p class='date'>").text(date));
	reviewContent.append($("<p>").text(item.get("review")));
	
	var votes = item.get("allVotes");
	if (votes > 0) {
		var upvote = item.get("upvotes");
		reviewContent.append($("<p class='help'>").text(upvote + " out of " + votes + " people found this review helpful"));
	}

	var trash = $("<i class='fa fa-trash-o i-trash'></i>");
	trash.click(function() {
		item.destroy({
			success: getData
		})
	})

	reviewContent.append($("<div class='delete'>").html(trash));
	review.append(reviewContent);
	$("#reviews").append(review);
}

// 
var helpful = function(thumb) {
	var query = new Parse.Query(Review);
	query.equalTo("objectId", thumb.parent().parent().parent().attr("id"));
	query.first({
		success: function (review) {
			review.increment("allVotes");
			if (thumb.attr("class").indexOf("up") > 0) {
				review.increment("upvotes");
			}
			review.save();
			getData();
		}
	});
};

var helpful = function(trash) {
	var query = new Parse.Query(Review)
}

var signin = function() {
	// var info = [];

	// $("#sign-in").find("input").each(function() {
	// 	info.push($(this).val());
	// 	$(this).val("");
	// });

	var username = $("#username").val();
	var password = $("#password").val();

	// Parse.User.logIn(info[0], info[1], {
	Parse.User.logIn(username, password).then(
		function(user) {
			loginS()
		},
		function(error) {
			console.log(error)
		}
	);
}

var loginS = function() {
	console.log("login success");
	// hide form in header
	$("#sign-in").css("display", "none");
	// add logout button
	$("#sign-out").css("display", "inline");
	// refresh the review section
	getData();
}

var signup = function() {
	var user = new Parse.User();

	$("#sign-in").find("input").each(function() {
		user.set($(this).attr("id"), $(this).val());
		$(this).val("");
	});

	user.signUp(null, {
		success: function(user) {
			alert("signup success");
			// hide form in header
			$("#sign-in").css("display", "none");
			// add logout button
			$("#sign-out").css("display", "inline");
			// refresh the review section
			getData();
		},
		error: function(user, error) {
			console.log(error);
		}
	});
}

var signout = function() {
	Parse.User.logOut();
	// show form again
	$("#sign-in").css("display", "block");
	// remove logout button
	$("#sign-out").css("display", "none");
}

