Parse.initialize("fenNu0bkpKIh4AdH35nwQh8Ooc0xbOUYGNit8nTa", "kh0Zpnieb5JXQm383d0MgWaLJIsOukSHNp8sg3mX");

var Review = Parse.Object.extend("Review");
var totalRating = 0;			// total rating added together
var numRating = 0;				// number of ratings product has

// current user needs to be checked when:
// upvoating reviews
// deleting reviews

// runs functions when page is done loading
$(function() {
	clickEvents();
	hoverEvents();

	$("#star").raty({
		score: 0
	});

	// checks if there's a session going on
	if (Parse.User.current()) {
		loginS();
	}

	getData();
});

// all the click events
var clickEvents = function() {
	$("#sign-in").submit(function() {
		signin();
		
		return false;
	});

	$("#sign-up").click(function () {
		signup();
		return false;
	});
	
	$("#sign-out").click(function() {
		signout();
		return false;
	});

	$('#submission').submit(function() {
		saving();
		return false;
	});

	$("#reviews").on("click", ".i-thumb", function() {
		helpful($(this));
	});

}

// mouseover and mouseleave events for the thumbs and trashcan
var hoverEvents = function() {
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

	$("#reviews").on("mouseover", ".i-trash", function() {
		$(this).attr("class", "fa fa-trash i-trash");
		
	});

	$("#reviews").on("mouseleave", ".i-trash", function() {
		$(this).attr("class", "fa fa-trash-o i-trash");
	});
}

// checks if the user is logged in
// if logged in then submit review to Parse
// if not alert to sign in
var saving = function() {
	var user = Parse.User.current();
	if (user) {
		var review = new Review();

		var score = parseInt($("#star").raty("score"), 10);
		// remind me to sanitize the score
		review.set("rating", score);

		// title, review
		$("#submission").find("div").each(function() {
			var part = $(this).children();
			review.set(part.attr("id"), part.val());
			console.log(part.val());
			part.val("");
		})
		
		review.set("upvotes", 0);
		review.set("allVotes", 0);
		review.set("user", user);
		review.set("ratedUsers", user.id);

		$("#star").raty({ score: 0 });
		review.save(null, {
		 	success:getData
		});
	} else {
		alert("You must sign in to write reviews");
	}
};

// get data from Parse
var getData = function() {
	var query = new Parse.Query(Review);

	// query requirement to have all 3 items
	// and sort by when they were submitted
	query.exists("rating");
	query.exists("title");
	query.exists("review");
	query.addDescending("createdAt");
	query.include("user");

	query.find({
		success:buildReviews
	});
}

// use data from getData to build list of reviews
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

// add reviews to the page
var addItem = function(item) {
	var author = item.get("user");
	var review = $("<div>").addClass("row");
	review.attr("id", item.id);
	var reviewContent = $("<div>").addClass("col-xs-12 pastReviews");
	
	totalRating += item.get("rating");
	numRating++;

	// adds star rating
	reviewContent.append($("<div class='reviewedRate'>").raty({ 
		score: item.get("rating"),
		width: 150,
		readOnly: true
	}));

	// adds title
	reviewContent.append($("<h4 id='rh4'>").text(item.get("title")));

	// adds the thumbs up and thumbs down
	var thumbs = $("<div>").addClass("thumb");
	thumbs.html("<i class='fa fa-thumbs-o-up i-thumb' title='You find this helpful'></i><i class='fa fa-thumbs-o-down i-thumb' title='You find this not helpful'></i>");
	reviewContent.append(thumbs);

	// creates the line with username and date it was created and adds it
	var date = " at " + item.get("createdAt");
	var username = $("<span class='name'>").text(author.get("username"));
	var dateLine = $("<p class='date'>").text("by ");
	dateLine.append(username);
	dateLine.append(date);
	reviewContent.append(dateLine);

	// adds the review
	reviewContent.append($("<p>").text(item.get("review")));
	
	// adds how many found this helpful
	var votes = item.get("allVotes");
	if (votes > 0) {
		var upvote = item.get("upvotes");
		reviewContent.append($("<p class='help'>").text(upvote + " out of " + votes + " people found this review helpful"));
	}

	// adds trash icon
	var trash = $("<i class='fa fa-trash-o i-trash'></i>");
	trash.click(function() {
		var user = Parse.User.current();
		if (user) {
			if (user.id == author.id) {
				item.destroy({
					success: getData
				})
			} else {
				alert("You can only delete your own reviews");
			}
		} else {
			alert("You must sign in to delete your reviews");
		}
	})

	reviewContent.append($("<div class='delete'>").html(trash));
	review.append(reviewContent);
	$("#reviews").append(review);
}

// increments thumbs up and thumbs down for the reviews
var helpful = function(thumb) {
	var query = new Parse.Query(Review);
	query.equalTo("objectId", thumb.parent().parent().parent().attr("id"));
	query.first({
		success: function (review) {
			var user = Parse.User.current();
			var author = review.get("user");
			if (user) {
				if (user.id != author.id) {
					var ratedUsers = review.get("ratedUsers");
					if (!ratedBefore(user.id, ratedUsers)) {
						review.increment("allVotes");
						if (thumb.attr("class").indexOf("up") > 0) {
							review.increment("upvotes");
						}
						review.addUnique("ratedUsers", user.id);
						review.save();
						getData();
					} else {
						alert("You can only rate once per review");
					}
				} else {
					alert("You cannot rate your own review");
				}
			} else {
				alert("You must sign in to rate reviews");
			}
		}
	});
};

// returns true if user is in users
var ratedBefore = function(user, users) {
    for (var i = 0; i < users.length; i++) {
        if (user == users[i]) {
            return true;
        }
    }
    return false; 
}

// sign in to Parse
var signin = function() {
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

// clears user values and shows sign out button
var loginS = function() {
	$("#username").val("");
	$("#password").val("");
	// hide form in header
	$("#sign-in").css("display", "none");
	// adds welcome message
	var user = Parse.User.current();
	$("#sign-out").before($("<p id='welcome'>").text("Welcome " + user.get("username")));
	// add logout button
	$("#sign-out").css("display", "inline");
	// refresh the review section
	getData();
}

// sign up new user
var signup = function() {
	var user = new Parse.User();

	$("#sign-in").find("input").each(function() {
		user.set($(this).attr("id"), $(this).val());
		$(this).val("");
	});

	user.signUp(null, {
		success: function(user) {
			loginS()
		},
		error: function(user, error) {
			console.log(error)
		}
	});
}

// sign out
var signout = function() {
	Parse.User.logOut();
	// show form again
	$("#sign-in").css("display", "block");
	// remove welcome message
	$("#welcome").remove();
	// remove logout button
	$("#sign-out").css("display", "none");
}

