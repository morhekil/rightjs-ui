/**
 * The header block tool
 *
 * Copyrigth (C) 2010 Nikolay Nemshilov
 */
Rte.Tool.Header = new Class(Rte.Tool, {
  shortcut: 'H',
  command:  'formatblock',

  initialize: function(rte) {
    this.$super(rte);
    this.value = rte.options.headerTag;
  }
});