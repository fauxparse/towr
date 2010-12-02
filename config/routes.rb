Towr::Application.routes.draw do
  get "new" => "maps#new", :as => :new_map
  
  get ":id" => "maps#show"
end
