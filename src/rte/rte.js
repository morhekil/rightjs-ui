/**
 * The Right Text Editor
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
var Rte = new Widget({

  extend: {
    EVENTS: $w('change focus blur'),

    // checking if the 'contentEditable' feature is supported at all
    supported: 'contentEditable' in document.createElement('div'),

    Options: {
      toolbar:     'small',  // toolbar, the name or an array of your own

      autoresize:  true,     // automatically resize the editor's height to fit the text

      showToolbar: true,     // show the toolbar
      showStatus:  true,     // show the status bar

      videoSize:   '425x344', // flash-video blocks default size

      cssRule:     'textarea[data-rte]'
    },

    // predefined toolbars set
    Toolbars: {
      small: ['bold italic underline strike ttext|cut copy paste|header code quote|link image video|source'],
      basic: [
        'save clear|cut copy paste|bold italic underline strike ttext|left center right justify',
        'undo redo|header code quote|link image video|dotlist numlist|indent outdent|source'
      ],
      extra: [
        'save clear|cut copy paste|bold italic underline strike ttext|left center right justify',
        'undo redo|header code quote|link image video|subscript superscript|dotlist numlist|indent outdent',
        'format|fontname fontsize|forecolor backcolor|source'
      ]
    },

    Tools: {}, // the index of available tools will be here

    // tags used by default with formatting tools
    Tags: {
      Bold:      'b',
      Italic:    'i',
      Underline: 'u',
      Strike:    's',
      Ttext:     'tt',
      Code:      'pre',
      Quote:     'blockquote',
      Header:    'h2'
    },

    // the formatting options, you can use simply tag names
    // or you can also specify tag + class like 'div.blue'
    Formats: {
      'h1':  'Header 1',
      'h2':  'Header 2',
      'h3':  'Header 3',
      'h4':  'Header 4',
      'p':   'Paragraph',
      'pre': 'Preformatted',
      'blockquote': 'Blockquote',
      'tt':         'Typetext',
      'address':    'Address'
    },

    // the font-name options
    FontNames: {
      'Andale Mono':     'andale mono,times',
      'Arial':           'arial,helvetica,sans-serif',
      'Arial Black':     'arial black,avant garde',
      'Book Antiqua':    'book antiqua,palatino',
      'Comic Sans MS':   'comic sans ms,sans-serif',
      'Courier New':     'courier new,courier',
      'Georgia':         'georgia,palatino',
      'Helvetica':       'helvetica',
      'Impact':          'impact,chicago',
      'Symbol':          'symbol',
      'Tahoma':          'tahoma,arial,helvetica,sans-serif',
      'Terminal':        'terminal,monaco',
      'Times New Roman': 'times new roman,times',
      'Trebuchet MS':    'trebuchet ms,geneva',
      'Verdana':         'verdana,geneva',
      'Webdings':        'webdings',
      'Wingdings':       'wingdings,zapf dingbats'
    },

    // the font-size options
    FontSizes: '6pt 7pt 8pt 9pt 10pt 11pt 12pt 14pt 18pt 24pt 36pt',

    Videos: [
      // supported swf video resources
      [/(http:\/\/.*?youtube\.[a-z]+)\/watch\?v=([^&]+)/,       '$1/v/$2'],
      [/(http:\/\/video.google.com)\/videoplay\?docid=([^&]+)/, '$1/googleplayer.swf?docId=$2'],
      [/(http:\/\/vimeo\.[a-z]+)\/([0-9]+).*?/,                 '$1/moogaloop.swf?clip_id=$2']
    ],

    i18n: {
      Clear:      'Clear',
      Save:       'Save',
      Source:     'Source',
      Bold:       'Bold',
      Italic:     'Italic',
      Underline:  'Underline',
      Strike:     'Strike through',
      Ttext:      'Typetext',
      Header:     'Header',
      Cut:        'Cut',
      Copy:       'Copy',
      Paste:      'Paste',
      Left:       'Left',
      Center:     'Center',
      Right:      'Right',
      Justify:    'Justify',
      Undo:       'Undo',
      Redo:       'Redo',
      Code:       'Code block',
      Quote:      'Block quote',
      Link:       'Add link',
      Image:      'Insert image',
      Video:      'Insert video',
      Dotlist:    'List with dots',
      Numlist:    'List with numbers',
      Indent:     'Indent',
      Outdent:    'Outdent',
      Forecolor:  'Text color',
      Backcolor:  'Background color',
      Select:     'Select',
      Remove:     'Remove',
      Format:     'Format',
      Fontname:   'Font name',
      Fontsize:   'Size',
      Subscript:  'Subscript',
      Superscript: 'Superscript',
      Symbol:     'Special character',
      UrlAddress: 'URL Address'
    },

    current: null
  },

  /**
   * Basic constructor
   *
   * @param Input textarea reference
   * @param Object additional options
   * @return void
   */
  initialize: function(textarea, options) {
    this
      .$super('rte', {})
      .setOptions(options, textarea)
      .append(
        this.toolbar = new Rte.Toolbar(this),
        this.editor  = new Rte.Editor(this),
        this.status  = new Rte.Status(this)
      );

    if (!this.options.showToolbar) {
      this.toolbar.hide();
    }

    if (!this.options.showStatus) {
      this.status.hide();
    }

    if (textarea) {
      this.assignTo(textarea);
    }

    this.undoer    = new Rte.Undoer(this);
    this.selection = new Rte.Selection(this);

    // updating the initial state
    this.exec('styleWithCss', false);
    this.status.update();
    this.undoer.save();
  },

  /**
   * Sets the value
   *
   * @param String value
   * @return Rte this
   */
  setValue: function(value) {
    if (this.textarea) {
      this.textarea.value(value);
    }
    this.editor.update(value);
    return this;
  },

  /**
   * Returns the current value
   *
   * @return String current value
   */
  getValue: function() {
    return this.editor._.innerHTML;
  },

  /**
   * Bidirectional method to set/get the value
   *
   * @param String value
   * @return Rte this or String value
   */
  value: function(value) {
    return this[value === undefined ? 'getValue' : 'setValue'](value);
  },

  /**
   * Disables the editor
   *
   * @return Rte this
   */
  disable: function() {
    this.disabled = true;
    return this.addClass('rui-rte-disabled');
  },

  /**
   * Enables the editor
   *
   * @return Rte this
   */
  enable: function() {
    this.disabled = false;
    return this.removeClass('rui-rte-disabled');
  },

  /**
   * Puts the focus into the editor
   *
   * @return Rte this
   */
  focus: function() {
    if (Rte.current !== this) {
      Rte.current = this;
      this.editor.focus();
    }

    return this;
  },

  /**
   * Looses focus from the editor
   *
   * @return Rte this
   */
  blur: function() {
    Rte.current = null;

    this.editor.blur();

    return this;
  },

  /**
   * Assigns this Rte to work with this textarea
   *
   * @param mixed textarea reference
   * @return Rte this
   */
  assignTo: function(element) {
    var textarea = $(element),
        size = textarea.size();

    // displaying self only if the 'contentEditable' feature is supported
    // otherwise keeping original textarea where it is
    if (Rte.supported) {
      this.insertTo(textarea.setStyle(
        'visibility:hidden;position:absolute;z-index:-1;top:-9999px;left:-9999px;'
      ), 'before');

      this.editor.resize(size);
      this.setWidth(size.x);

      if (this.options.autoresize) {
        this.editor.setStyle({
          minHeight: size.y + 'px',
          height:  'auto'
        });
      }
    } else {
      textarea.setStyle('visibility:visible');
    }

    this.setValue(textarea.value());
    this.onChange(function() {
      textarea._.value = this.editor._.innerHTML;
    });

    this.textarea = textarea;

    return this;
  },

// protected

  /**
   * executes a command on this editing area
   *
   * @param String command name
   * @param mixed command value
   * @return Rte.Editor this
   */
  exec: function(command, value) {
    try {
      // it throws errors in some cases in the non-design mode
      document.execCommand(command, false, value);
    } catch(e) {
      // emulating insert html under IE
      if (command === 'inserthtml') {
        try {
          this.selection.get().pasteHTML = value;
        } catch(e) {}
      }
    }

    return this;
  }
});