/*global $ */

if (typeof Commentable === "undefined") {
    $(function () {
        Commentable = (function () {
            var CONFIG = {
                $container: $('.commentable-container'),
                // NOTE: commentable elements must have position: relative,
                // but the default position is static
                $commentables: $('.commentable-container > p, center').add('.commentable-container li').not('.nocom'),
                $comment_dialog: $('#comment-form-tabs'),
                $comment_form: $('#comment-form'),
                $comment_error_div: $('#comments-error-message'),
                $comment_index_input: $('input[name=nodenum]'),
                $comment_text_input: $('textarea[name=comment]'),
                $name_input: $('input[name=name]'),
                $allcomments_link: $('#allcomments-link'),
                postcomments_tab_id: 0,
                allcomments_tab_id: 1
            };
            var reset_comments_form = function() {
                CONFIG.$comment_error_div.html('');
                CONFIG.$comment_text_input.val('');
                CONFIG.$name_input.val('');
            }
            var get_num_comments = function (block_index) {
                return  parseInt($('#c' + block_index + ' .comment-button > span').html());
            };
            var open_dialog_func = function(block_index) {
                return function () {
                    // destroy tabs, change ajax links, and recreate
                    CONFIG.$comment_dialog.tabs('destroy');
                    reset_comments_form();
                    CONFIG.$comment_index_input.val(block_index);
                    CONFIG.$allcomments_link.attr('href', 'comments?nodenum=' + block_index)
                    CONFIG.$comment_dialog.tabs();
                    var num_comments = get_num_comments(block_index);
                    if (num_comments > 0) {
                        CONFIG.$comment_dialog.tabs('select', CONFIG.allcomments_tab_id);
                    } else {
                        CONFIG.$comment_dialog.tabs('select', CONFIG.postcomments_tab_id);
                    }
                    // reposition dialog and open
                    CONFIG.$comment_dialog.dialog( "option", "position", 'center' );
                    CONFIG.$comment_dialog.dialog('open');
                };
            };
            var add_comment_boxes = function () {
                var container_left = CONFIG.$container.offset().left,
                container_left_margin = parseInt(CONFIG.$container.css('marginLeft').replace('px', ''));
                CONFIG.$commentables.each(function (index) {
                    this.id = 'c' + index;
                    var that = this;
                    $.getJSON('/comments?comcount_req=1&nodenum=' + index, function (data) {
                        var $comment_button = $('<div class="comment-button"><span></span></div>');
                        if (data.count === 0) {
                            $comment_button.addClass('uncommented');
                        } else {
                            $comment_button.children('span').html(data.count);
                            $comment_button.addClass('commented');
                        }
                        var left_border = parseInt($(that).css('border-left-width').replace('px', ''));
                        $comment_button.css('left', (container_left - container_left_margin) - (parseInt($(that).offset().left) + left_border));
                        $comment_button.css('height', $(that).css('height'));
                        $(that).append($comment_button);
                        $comment_button.click(open_dialog_func(index));
                    });
                });
            };
            return {
                close_dialog: function () {
                    CONFIG.$comment_dialog.dialog('close');
                },
                submit_comment: function () {
                    if (CONFIG.$comment_index_input.val() === '' || CONFIG.$comment_text_input.val() === '' || CONFIG.$name_input.val() === '') {
                        CONFIG.$comment_error_div.html("Please fill in all fields");
                        return false;
                    }
                    CONFIG.$comment_error_div.html("loading...");
                    $.post('/comments', CONFIG.$comment_form.serialize(), function () {
                        var nodenum = CONFIG.$comment_form.find('input[type="hidden"]').val();
                        var $comment_button = $('#c' + nodenum + ' .comment-button');
                        var $span = $comment_button.children('span');
                        if ($span.html() === "") {
                            $span.html(1);
                        } else {
                            $span.html(parseInt($span.html()) + 1);
                        }
                        if (parseInt($span.html()) >= 0) {
                            $comment_button.removeClass('uncommented');
                            $comment_button.addClass('commented');
                        }
                        CONFIG.$comment_dialog.tabs('select', CONFIG.allcomments_tab_id);
                        reset_comments_form();
                        CONFIG.$comment_error_div.html("Comment submitted");
                    });
                    return false;
                },
                init: function () {
                    CONFIG.$comment_dialog.tabs();
                    CONFIG.$comment_dialog.dialog({autoOpen: false, minWidth: 440});
                    add_comment_boxes();
                }
            };
        }());
        Commentable.init();
    });
}

