/*global $ */

if (typeof Commentable === "undefined") {
    $(function () {
        Commentable = (function () {
            var CONFIG = {
                $commentables: $('.commentable-container > p').not('.nocom'),
                $comment_dialog: $('#comment-form-tabs'),
                $comment_form: $('#comment-form'),
                $comment_error_div: $('#comments-error-message'),
                $comment_index_input: $('input[name=nodenum]'),
                $comment_text_input: $('textarea[name=comment]'),
                $name_input: $('input[name=name]'),
                $allcomments_link: $('#allcomments-link'),
                comment_btn_cls: 'comment-button',
                allcomments_tab_id: 1
            };
            var reset_comments_form = function() {
                CONFIG.$comment_error_div.html('');
                CONFIG.$comment_text_input.val('');
                CONFIG.$name_input.val('');
            }
            var open_dialog_func = function(block_index) {
                return function () {
                    // destroy tabs, change ajax links, and recreate
                    CONFIG.$comment_dialog.tabs('destroy');
                    reset_comments_form();
                    CONFIG.$comment_index_input.val(block_index);
                    CONFIG.$allcomments_link.attr('href', 'comments?nodenum=' + block_index)
                    CONFIG.$comment_dialog.tabs();
                    CONFIG.$comment_dialog.tabs('select', CONFIG.allcomments_tab_id)
                    // reposition dialog and open
                    CONFIG.$comment_dialog.dialog( "option", "position", 'center' );
                    CONFIG.$comment_dialog.dialog('open');
                };
            };
            var add_comment_boxes = function () {
                CONFIG.$commentables.each(function (index) {
                    this.id = 'c' + index;
                    var $comment_button = $('<div class="' + CONFIG.comment_btn_cls + '"></div>')
                    $comment_button.css('height', $(this).css('height'));
                    $(this).append($comment_button);
                    $comment_button.click(open_dialog_func(index));
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
                        CONFIG.$comment_dialog.tabs('select', CONFIG.allcomments_tab_id)
                        reset_comments_form();
                        CONFIG.$comment_error_div.html("Comment submitted");
                    });
                    return false;
                },
                init: function () {
                    CONFIG.$comment_dialog.tabs();
                    CONFIG.$comment_dialog.dialog({autoOpen: false, minWidth: 520});
                    add_comment_boxes();
                }
            };
        }());
        Commentable.init();
    });
}

