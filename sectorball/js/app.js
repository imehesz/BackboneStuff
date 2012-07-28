$(document).ready(function(){
    var Article = Backbone.Model.extend({
        defaults: {
            sortid: 0,
            title: "Article Title",
            content: "Article Content",
            published: false
        }
    });

    var ArticleView = Backbone.View.extend({
        initialize: function(){
            this.render();      
        },
        
        template:_.template($('#article_template').html()),    
            
        render: function(event_name){
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
        
        events: {
            // e - event
            "click .article_title": 
                function(e){ 
                    this.$el.find('.article_body').fadeToggle(); 
                }
        },    
    });
                      
    var Articles = Backbone.Collection.extend({
        model: Article,
        url: 'js/data/articles.json',
        
        search : function(letters){
            if(letters == "") return this;
            
            var pattern = new RegExp(letters,"gi"),
                models = [];

            // originally this was returned, but it was not working 
            // properly, every second model was skipped
            /*
            var found = _(this.filter(function(data) {
                return pattern.test(data.get("title"));
            }));
            */
            
            // this is still not working
            /*
            console.log( this.models.length );
            _.each( this.models, function(item){
                if( pattern.test(item.get('title')) )
                {
                    models.push( item );
                }
            });
            */
            
            // works !!!
            for( var i=0; i<this.models.length;i++ )
            {
                var item = this.models[i],
                    title = item.get('title'),
                    content = item.get('content');
                
                // TODO maybe use REGEXP for search, but it's probably slower!
                if( title.toLowerCase().indexOf( letters.toLowerCase() ) > -1 || content.toLowerCase().indexOf( letters.toLowerCase ) > -1 )
                {
                    models.push( item )
                }            
            }
            
            return models;
            
            // this is still not the right solution, but at least
            // it does search for something
            //return found._wrapped;
        }    
    });

    var ArticlesView = Backbone.View.extend({
        el: '#articles',
        collection: this.myArticles,
        initialize: function(){
            //console.log( Articles.models );
            this.model.bind('change', _.bind(this.searchArticle, this));
            this.renderList(this.model.models);
            //this.model.bind("reset", this.render, this);
            
        },
        renderList : function(articles){
            if( articles.length == 0 )
            {
                $("#article_list").html("No results found :/");
                return this;
            }
            else
            {
                $("#article_list").html("");
            }
            
            //_.each(this.model.models, function(article){
            _.each(articles, function(article){
                var view = new ArticleView({
                    model: article,
                    collection: this.collection
                });
                $("#article_list").append(view.render().el);
            });

            // if we only have 1 result, we show it in full glory
            if( articles.length == 1 )
            {
                $('.article_body').show();
            }
            return this;
        },    
        render: function(){
            return;
            var template = _.template( $("#article_list").html(), {} );
            
            _.each(this.model.models, function (article){
                $(this.el).append(new ArticleView({model:article}).render().el);
            }, this);
            
            return this;        
        },
        
        events:{
            "keyup #search_article" : 'searchArticle'
        },
        
        searchArticle: function(){ 
                var letters = $("#search_article").val();
                if( letters.length > 2 )
                {                
                    this.renderList(this.model.search(letters));                
                }
                else
                {
                    this.renderList(this.model.models);          
                }
            }    
    });
        
    var myArticles = new Articles;

    // TODO maybe there is a better way to trigger the ArticlesView()-t
    myArticles.fetch().complete(
        function(){
            var articles_view = new ArticlesView({model: myArticles});
        });
});
