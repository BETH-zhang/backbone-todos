/**********************************************
 * created by beth on 2016年7月1日
 * todos
 **********************************************/

 $(function(){

 	// console.log('Backbone.Model', Backbone.Model);
 	// console.log('Backbone.Collection', Backbone.Collection);
 	// console.log('Backbone.View', Backbone.View);

 	var Todo = Backbone.Model.extend({
 		defaults: function(){
 			// console.log('Todo.defaults');
 			// console.log('Todos.nextOrder()', Todos.nextOrder());
 			return {
 				title: 'empty todo...',
 				order: Todos.nextOrder(),
 				done: false
 			}
 		},

 		toggle: function(){
 			// console.log('Todo.toggle');
 			this.save({
 				done: !this.get("done")
 			});
 		}
 	});

 	var TodoList = Backbone.Collection.extend({
 		model: Todo,
 		localStorage: new Backbone.LocalStorage("todos-backbone"),
 		done: function(){
 			// console.log('todolist.done');
 			return this.where({done: true});
 		},
 		remaining: function(){
 			// console.log('todolist.remaining');
 			return this.where({done: false});
 		},
 		nextOrder: function(){
 			// console.log('todolist.nextOrder');
 			if(!this.length) return 1;
 			return this.last().get('order')+1;
 		},
 		comparator: 'order'
 	});

 	var Todos = new TodoList;

 	var TodoView = Backbone.View.extend({
 		tagName: 'li',
 		template: _.template($('#item-template').html()),
 		events: {
 			"click .toggle" : "toggleDone",
 			"dblclick .view" : "edit",
 			"click a.destroy" : "clear",
 			"keypress .edit" : "updateOnEnter",
 			"blur .edit" : "close"
 		},
 		initialize: function(){
 			this.listenTo(this.model, 'change', this.render);
 			this.listenTo(this.model, 'destroy', this.remove);
 		},
 		render: function(){
 			// console.log(this.template(this.model.toJSON()));
 			// console.log('this.model.toJSON()',this.model.toJSON());
 			this.$el.html(this.template(this.model.toJSON()));
 			this.$el.toggleClass('done', this.model.get('done'));
 			this.input = this.$('.edit');
 			// console.log('this', this);
 			return this;
 		},
 		toggleDone: function(){
 			this.model.toggle();
 		},
 		edit: function(){
 			this.$el.addClass('editing');
 			this.input.focus();
 		},
 		close: function(){
 			var value = this.input.val();
 			console.log('value', value);
 			if(!value){
 				this.clear();
 			}else{
 				this.model.save({title: value});
 				this.$el.removeClass("editing");
 			}
 		},
 		updateOnEnter: function(e){
 			if(e.keyCode == 13){
 				this.close();
 			}
 		},
 		clear: function(){
 			// console.log('--', this.model);
 			this.model.destroy();
 		}
 	});

	var AppView = Backbone.View.extend({
		el: $('#todoapp'),
		statsTemplate: _.template($('#stats-template').html()),
		events: {
			"keypress #new-todo": 'createOnEnter',
			'click #clear-completed': 'clearCompleted',
			'click #toggle-all': 'toggleAllComplete'
		},
		initialize: function(){
			this.input = this.$("#new-todo");
			this.allCheckbox = this.$('#toggle-all')[0];

			this.listenTo(Todos, 'add', this.addOne);
			this.listenTo(Todos, 'reset', this.addAll);
			this.listenTo(Todos, 'all', this.render);

			this.footer = this.$('footer');
			this.main = $('#main');

			Todos.fetch();
		},
		render: function(){
			var done = Todos.done().length;
			var remaining = Todos.remaining().length;

			if(Todos.length){
				this.main.show();
				this.footer.show();
				this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
			}else{
				this.main.hide();
				this.footer.hide();
			}

			this.allCheckbox.checked = !remaining;

		},
		addOne: function(todo){
			var view = new TodoView({model: todo});
			this.$("#todo-list").append(view.render().el);
		},
		addAll: function(){
			Todos.each(this.addOne, this);
		},
		createOnEnter: function(e){
			if(e.keyCode != 13) return;
			if(!this.input.val()) return;

			Todos.create({title: this.input.val()});
			this.input.val('');
		},
		clearCompleted: function(){
			_.invoke(Todos.done(), 'destroy');
			return false;
		},
		toggleAllComplete: function(){
			var done = this.allCheckbox.checked;
			Todos.each(function(todo){
				todo.save({'done': done});
			});
		}
	});

	var App = new AppView;
 });