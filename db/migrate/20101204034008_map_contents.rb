class MapContents < ActiveRecord::Migration
  def self.up
    rename_column :maps, :routes, :contents
  end

  def self.down
    rename_column :maps, :contents, :routes
  end
end
