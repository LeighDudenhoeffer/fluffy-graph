var correct_answer = -1;
var correct_answers = -1;

var current_level = undefined;
var new_level = undefined;

var game_is_on = true;
var timer = 0;

var timer_id = -1;

var ADD_SECOND_PER_LEVELS = 10;

/*
 * Utilities
 */

function draw_graphs(reference_graph, choices, correct_answer) {
    var reference_bucket = draw_graph(reference_graph, $("div#reference_graph"), -1);

    var div_choices = $("div#choices");
    div_choices.html("");
    for (var i in choices) {
        var div_choice = $("<div class='choice'>").attr("data-number", i);
        div_choices.append(div_choice);
        console.log(i, current_level.correct_answer, reference_bucket);
        draw_graph(choices[i], div_choice, (i == current_level.correct_answer) ? reference_bucket : -1);
    }
}

/*
 * Switch between levels logic
 */

function start_timer() {
    set_timer(10);
    timer_id = setInterval(function() {
        decrement_time()
    }, 1000);
}

function start_new_game() {
    $('.game-over').hide();
    game_is_on = true;
    generate_new_level();
    correct_answers = 0;
    $("#counter").text(correct_answers);
    switch_to_new_level();
    start_timer();
    hearts = 3;
    visualize_hearts();
}

function pass_level() {
    var current_correct_answers = ++correct_answers;
    
    // Visualize green color around correct-answers counter
    $('#counter').addClass('counter-win');
    setTimeout(function() {
        if (current_correct_answers == correct_answers) {
            $('#counter').removeClass('counter-win');
        }
    }, 300);
    
    add_to_timer(3 + Math.round(correct_answers / ADD_SECOND_PER_LEVELS));
    $("#counter").text(correct_answers);
    switch_to_new_level();
}

function regenerate_level() {
    generate_level(correct_answers);
    switch_to_new_level();
}

function fail_level() {
    hearts--;
    visualize_hearts();

    // Visualize red color around correct-answers counter
    var current_hearts = hearts;
    $('#counter').addClass('counter-fail');
    setTimeout(function() {
        if (current_hearts == hearts) {
            $('#counter').removeClass('counter-fail');
        }
    }, 300);

    if (hearts <= 0) {
        lose();
    } else {
        regenerate_level();
    }
}

function lose() {
    $('.game-over').show();
    clearInterval(timer_id);
    game_is_on = false;
    $('#timer').html("<span class='lost'>no</span>");
}

function generate_level(level) {
    console.log('level: ' + level);
    var num_choices = (correct_answers >= 5) ? ((correct_answers >= 30) ? 4 : 3) : 2;

    var reference_graph = random_randrange(levels[level].length);

    var choices = []
    var choices_indices = []
    for (var i = 0; i < num_choices - 1; ++i) {
        if (choices.length + 1 < levels[level].length) {
            var choice = random_randrange_excluded(levels[level].length, choices_indices.concat([reference_graph]))
        } else {
            var choice = random_randrange_excluded(levels[level].length, reference_graph);
        }
        choices.push(levels[level][choice]);
        choices_indices.push(choice);
    }

    reference_graph = levels[level][reference_graph];

    var correct_answer = random_randrange(num_choices)
    choices = choices.slice(0, correct_answer).concat([reference_graph]).concat(choices.slice(correct_answer));

    new_level = {
        correct_answer: correct_answer,
        reference_graph: reference_graph,
        choices: choices
    };
}

function generate_new_level() {
    var level = Math.min(correct_answers, levels.length - 1) + 1;
    generate_level(level);
}

function switch_to_new_level() {
    current_level = new_level;
    draw_graphs(current_level.reference_graph, current_level.choices);
    // dirty hack. otherwise it doesn't redraw
    // setTimeout(generate_new_level, 5);
    generate_new_level();
}

function handle_choice(k) {
    if (game_is_on) {
        if (k == current_level.correct_answer) {
            pass_level();
        } else {
            fail_level();
        }
    }
}

/*
 * Timer functions
 */

function visualize_timer() {
    $('#timer').text(timer);
}

function set_timer(n) {
    timer = n;
    visualize_timer();
}

function add_to_timer(n) {
    timer += n;
    visualize_timer();
}

function decrement_time() {
    if (game_is_on) {
        timer--;
        visualize_timer();
    };
    if (timer <= 0) {
        lose();
    }
}

/*
 * Hearts functions
 */

function visualize_hearts() {
    $('#hearts').html('');
    for (var i = 0; i < hearts; ++i) {
        $('#hearts').append($('<i class="fa fa-heart">'));
    }
}

$(function() {
    start_new_game();

    $(document).on('click', '.choice', function() {
        handle_choice($(this).attr("data-number"));
    });

    $(document).on('keypress', 'html', function(event) {
        handle_choice(event.keyCode - 49);
    });

    $(document).on('click', '#try-again', function() {
        start_new_game();
    });
});
