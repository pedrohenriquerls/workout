var Logger = Logger || {};

Logger.Exercise = Backbone.Model.extend({

    defaults: function(){
        return {
              hours: ""
            , type: 'Run'
            , date: this.today()
        };
    },

    today: function(){
      var date = new Date();
      return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    }
});

Logger.ExerciseList = Backbone.Collection.extend({
    model: Logger.Exercise,

    initialize: function (models, options) {
      this.on("add", options.view.addRow);
    }

});

Logger.LoggerView = Backbone.View.extend({

    el: '#logger',

    events: {
      'click #add'                :'createLog',
      'keypress #hour-input'      :'createOnEnter',
      'keypress #type-option'     :'createOnEnter',
      'keypress #date-input'      :'createOnEnter',
      'keypress #add'             :'createOnEnter'
    },

    initialize: function() {
    
      $('table').hide();
      
      this.logs = new Logger.ExerciseList(null, {view: this});

      this.hours = this.$('#hour-input');
      this.type = this.$('#type-option');
      this.date = this.$('#date-input');

      this.clearFields();

      this.logs.on('all', this.hasTable, this);

    },

    createLog: function(){
      var values = this.getValues();

        if (values.valid){
            var ex = new Logger.Exercise({
                  hours: values.hours
                , type:  values.type
                , date:  values.date
            });
            this.logs.add(ex);
        }

        this.clearFields();
        
    },

    createOnEnter: function(e){
      if ( e.which === 13 ) {
        this.createLog();
      }
    },

    getValues: function(){
      var _hours = $.trim(this.hours.val());
      var _type = this.type.val();
      var _date = $.trim(this.date.val());

      if(_hours === '' || isNaN(_hours) || _hours > 24)
        return {valid: false};

      if(_date === '')
        _date = this.toToday();

      if(_type === '')
        _type = "Run";

      return {valid: true, hours: _hours, type: _type, date: _date};

    },

    toToday: function(){
      var reset = new Logger.Exercise();
      return reset.get('date');
    },

    clearFields: function(){
      var reset = new Logger.Exercise();
      this.hours.val(reset.get('hours'));
      this.type.val(reset.get('type'));
      this.date.val(reset.get('date'));
    },

    addRow: function(model){
        var view = new Logger.RowView({model: model});
        $('table tbody').append(view.render().el);
    },

    hasTable: function(){
        var rows = $('tbody tr');
        if(rows.length === 0) $('table').hide();
    }

  });

Logger.RowView = Backbone.View.extend({

    tagName: 'tr',

    events: {
      'click .destroy': 'clear'
    },

    template: _.template($('#row-template').html()),

    initialize: function(model) {
      this.model.on('destroy', this.deleteRow, this);
      $('table').show();
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    clear: function() {
      this.model.destroy();
    },

    deleteRow: function(){
      var element = this.$el;
      element.remove();
    }
  });

$(function() {
  new Logger.LoggerView();
});